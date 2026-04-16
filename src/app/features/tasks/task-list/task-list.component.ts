import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {

  tasks: TaskDto[] = [];
  activeTab: 'all' | 'in_progress' | 'overdue' | 'in_review' | 'revision' | 'agreed' = 'all';
  isAdmin = false;
  currentUserId: number = 0;
  today = new Date().toISOString().split('T')[0];
  selectedTask: TaskDto | null = null;
  showTaskModal = false;
  sortBy: 'priority' | 'dueDate' = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'desc';   // desc = от высокого/позднего к низкому/раннему
  showRevisionModal = false;
  revisionComment: string = '';
  revisionTaskId: number | null = null;
  
  

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
        this.loadTasks();
      }
    });
  }
  applySorting() {
    this.tasks.sort((a, b) => {
      let comparison = 0;

      if (this.sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { 
          'HIGH': 3, 
          'MEDIUM': 2, 
          'LOW': 1 
        };
        comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (this.sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = dateB - dateA;
      }

      return this.sortDirection === 'desc' ? comparison : -comparison;
    });
  }
  toggleSort(field: 'priority' | 'dueDate') {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.applySorting();
  }

  // Отдельный метод для кнопки "По возрастанию / По убыванию"
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.applySorting();
  }
  openTaskDetail(taskId: number) {
    this.router.navigate(['/tasks', taskId]);
  }
  loadTasks() {
    if (this.isAdmin) {
      this.taskService.getAll().subscribe({
        next: (data: any) => {
          this.tasks = Array.isArray(data) ? data : (data?.content || []);
        },
        error: (err) => console.error(err)
      });
    } else {
      this.taskService.getMyTasks().subscribe({
        next: (data: any) => {
          this.tasks = Array.isArray(data) ? data : (data?.content || []);
        },
        error: (err) => console.error(err)
      });
    }
  }
  getPriorityClass(priority: string): string {
    if (priority === 'HIGH') return 'bg-danger text-white';
    if (priority === 'MEDIUM') return 'bg-warning text-dark';
    if (priority === 'LOW') return 'bg-success text-white';
    return 'bg-secondary';
  }

  setTab(tab: 'all' | 'in_progress' | 'overdue' | 'in_review' | 'revision' | 'agreed') {
    this.activeTab = tab;
  }

  getFilteredTasks() {
    let filtered = this.tasks;

    // Фильтрация по вкладкам — теперь работает и для админа
    if (this.activeTab !== 'all') {
      if (this.activeTab === 'in_progress') {
        filtered = filtered.filter(task => task.status === 'IN_PROGRESS');
      } 
      else if (this.activeTab === 'overdue') {
        filtered = filtered.filter(task => task.dueDate && task.dueDate < this.today);
      } 
      else if (this.activeTab === 'in_review') {
        filtered = filtered.filter(task => task.adminStatus === 'IN_REVIEW');
      } 
      else if (this.activeTab === 'agreed') {
        filtered = filtered.filter(task => task.adminStatus === 'AGREED');
      } 
      else if (this.activeTab === 'revision') {
        filtered = filtered.filter(task => task.adminStatus === 'REVISION');
      }
    }

    return filtered;
  }
  

    updateStatus(taskId: number, newStatus: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!this.isAdmin) {
      // Обычный пользователь
      if (task.status === 'COMPLETED') {
        Swal.fire('Задача завершена', 'Вы не можете изменить статус выполненной задачи', 'info');
        return;
      }

      if (newStatus !== 'NEW' && newStatus !== 'IN_PROGRESS' && newStatus !== 'COMPLETED') {
        Swal.fire('Ограничение', 'Вы можете менять только статус выполнения', 'info');
        return;
      }

      if (newStatus === 'COMPLETED') {
        Swal.fire({
          title: 'Завершить задачу?',
          text: 'После этого вы больше не сможете изменить статус этой задачи.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Да, завершить',
          cancelButtonText: 'Отмена',
          confirmButtonColor: '#28a745'
        }).then((result) => {
          if (result.isConfirmed) {
            this.completeTask(taskId);
          }
        });
        return;
      }
    } 
    else {
      // Админ
      if (newStatus === 'REVISION') {
        // Админ ставит "На доработку" → у пользователя статус становится "Новая"
        this.taskService.updateStatus(taskId, 'NEW').subscribe({
          next: () => {
            this.executeUpdate(taskId, newStatus);
          },
          error: () => this.executeUpdate(taskId, newStatus)
        });
        return;
      }
    }

    this.executeUpdate(taskId, newStatus);
  }

  // Специальный метод для завершения задачи пользователем
  private completeTask(taskId: number) {
    // Сначала ставим админу "В обработке"
    this.taskService.updateStatus(taskId, 'IN_REVIEW').subscribe({
      next: () => {
        // Затем ставим пользователю "Выполнено"
        this.taskService.updateStatus(taskId, 'COMPLETED').subscribe({
          next: () => this.loadTasks(),
          error: (err) => Swal.fire('Ошибка', 'Не удалось завершить задачу', 'error')
        });
      },
      error: (err) => Swal.fire('Ошибка', 'Не удалось поставить "В обработке"', 'error')
    });
  }

  private executeUpdate(taskId: number, newStatus: string) {
    this.taskService.updateStatus(taskId, newStatus).subscribe({
      next: () => this.loadTasks(),
      error: (err) => Swal.fire('Ошибка', 'Не удалось обновить статус', 'error')
    });
  }

  deleteTask(taskId: number) {
    if (!this.isAdmin) {
      Swal.fire('Доступ запрещён', 'Удалять задачи может только администратор', 'error');
      return;
    }

    Swal.fire({
      title: 'Удалить задачу?',
      text: 'Это действие нельзя отменить',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Отмена',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.delete(taskId).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            Swal.fire('Удалено!', 'Задача успешно удалена', 'success');
          },
          error: () => Swal.fire('Ошибка', 'Не удалось удалить задачу', 'error')
        });
      }
    });
  }
  // Уведомления
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number) {
    // Логика отметки уведомления как прочитанного
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.unreadCount = 0;
  }
  

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  isTaskCompleted(task: TaskDto): boolean {
    return !this.isAdmin && task.status === 'COMPLETED';
  }

  getExecutorStatusName(status: string): string {
    const names: any = {
      'NEW': 'Новая',
      'IN_PROGRESS': 'В работе',
      'COMPLETED': 'Выполнено'
    };
    return names[status] || status;
  }

  getExecutorStatusClass(status: string): string {
    const classes: any = {
      'NEW': 'bg-primary',
      'IN_PROGRESS': 'bg-warning',
      'COMPLETED': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
  }

  getAdminStatusName(status: string): string {
    const names: any = {
      'IN_REVIEW': 'В обработке',
      'AGREED': 'Согласовано',
      'REVISION': 'На доработку'
    };
    return names[status] || status;
  }

  getAdminStatusClass(status: string): string {
    const classes: any = {
      'IN_REVIEW': 'bg-info',
      'AGREED': 'bg-success',
      'REVISION': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
  
  

  // Добавь эти методы в конец класса (перед последней })
  openTaskModal(task: TaskDto) {
    this.selectedTask = task;
    this.showTaskModal = true;
  }

  closeTaskModal() {
    this.showTaskModal = false;
    this.selectedTask = null;
  }
  // Для модального окна завершения задачи
  showCompletionModal = false;
  selectedTaskId: number | null = null;
  completionReport: string = '';
  selectedCompletionFile: File | null = null;

  // Открыть модальное окно завершения
  openCompletionModal(taskId: number) {
    this.selectedTaskId = taskId;
    this.completionReport = '';
    this.selectedCompletionFile = null;
    this.showCompletionModal = true;
  }

  closeCompletionModal() {
    this.showCompletionModal = false;
    this.selectedTaskId = null;
    this.completionReport = '';
    this.selectedCompletionFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedCompletionFile = file;
    }
  }

  downloadCompletionFile() {
    if (!this.selectedCompletionFile) return;
    const url = window.URL.createObjectURL(this.selectedCompletionFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.selectedCompletionFile.name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  submitCompletion() {
    if (this.selectedTaskId === null || !this.completionReport.trim()) {
      Swal.fire('Ошибка', 'Описание выполненной работы обязательно', 'warning');
      return;
    }

    const taskId = this.selectedTaskId;
    const task = this.tasks.find(t => t.id === taskId);

    this.taskService.updateStatus(taskId, 'COMPLETED').subscribe({
      next: () => {
        Swal.fire('Задача завершена', 'Отчёт успешно сохранён', 'success');

        // Уведомление ТОЛЬКО АДМИНУ
        if (task) {
          this.notificationService.addNotification(
            'Задача завершена пользователем',
            `Пользователь завершил задачу: "${task.title}"`,
            'success',
            taskId,
            null as any   // <-- это решает ошибку типа
          );
        }

        this.closeCompletionModal();
        this.loadTasks();
      },
      error: () => Swal.fire('Ошибка', 'Не удалось завершить задачу', 'error')
    });
  }

  openRevisionModal(taskId: number) {
    this.revisionTaskId = taskId;
    this.revisionComment = '';
    this.showRevisionModal = true;
  }

  closeRevisionModal() {
    this.showRevisionModal = false;
    this.revisionTaskId = null;
  }

  submitRevision() {
    if (this.revisionTaskId === null) return;

    const taskId = this.revisionTaskId;
    const task = this.tasks.find(t => t.id === taskId);

    if (!task) return;

    // 1. Сбрасываем статус пользователя на "Новая"
    this.taskService.updateStatus(taskId, 'NEW').subscribe({
      next: () => {
        // 2. Ставим админу статус "REVISION"
        this.taskService.updateStatus(taskId, 'REVISION').subscribe({
          next: () => {
            Swal.fire('Отправлено на доработку', 'Статус пользователя сброшен на "Новая"', 'success');

            // Уведомление только исполнителю задачи
            if (task.assigneeId) {
              this.notificationService.addNotification(
                'Задача возвращена на доработку',
                `Задача "${task.title}" отправлена администратором на доработку.`,
                'warning',
                taskId,
                task.assigneeId
              );
            }

            this.closeRevisionModal();
            this.loadTasks();
          },
          error: () => Swal.fire('Ошибка', 'Не удалось поставить REVISION', 'error')
        });
      },
      error: () => Swal.fire('Ошибка', 'Не удалось сбросить статус на NEW', 'error')
    });
  }
  handleUserAction(task: TaskDto) {
    if (task.status === 'NEW') {
      this.updateStatus(task.id, 'IN_PROGRESS');
    } else if (task.status === 'IN_PROGRESS') {
      this.openCompletionModal(task.id);
    }
  }
  
}