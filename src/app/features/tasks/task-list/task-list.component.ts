import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
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

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
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

    // Фильтр по вкладкам (для обычного пользователя)
    if (!this.isAdmin && this.activeTab !== 'all') {
      filtered = filtered.filter(task => {
        if (this.activeTab === 'in_progress') return task.status === 'IN_PROGRESS';
        if (this.activeTab === 'overdue') return task.dueDate && task.dueDate < this.today;
        if (this.activeTab === 'in_review') return task.adminStatus === 'IN_REVIEW';
        if (this.activeTab === 'revision') return task.adminStatus === 'REVISION';
        if (this.activeTab === 'agreed') return task.adminStatus === 'AGREED';
        return true;
      });
    }

    return filtered;
  }
  

  updateStatus(taskId: number, newStatus: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!this.isAdmin) {
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
            this.executeUpdate(taskId, newStatus);
          }
        });
        return;
      }
    }

    this.executeUpdate(taskId, newStatus);
  }

  private executeUpdate(taskId: number, newStatus: string) {
    if (!this.isAdmin && newStatus === 'COMPLETED') {
      this.taskService.updateStatus(taskId, 'IN_REVIEW').subscribe({
        next: () => this.loadTasks(),
        error: () => console.error('Не удалось поставить IN_REVIEW')
      });
    }

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
}