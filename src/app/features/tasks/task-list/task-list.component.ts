import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  filter: 'all' | 'today' | 'overdue' = 'all';
  isAdmin = false;
  currentUserId: number = 0;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private taskService: TaskService,
    private authService: AuthService
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

  changeFilter(newFilter: 'all' | 'today' | 'overdue') {
    this.filter = newFilter;
    this.loadTasks();
  }

  updateStatus(taskId: number, status: string) {
    this.taskService.updateStatus(taskId, status).subscribe({
      next: () => this.loadTasks(),
      error: () => Swal.fire('Ошибка', 'Не удалось обновить статус', 'error')
    });
  }

  deleteTask(taskId: number) {
    if (!this.isAdmin) {
      Swal.fire('Ошибка', 'Только администратор может удалять задачи', 'error');
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
            Swal.fire('Удалено', 'Задача успешно удалена', 'success');
          },
          error: () => Swal.fire('Ошибка', 'Не удалось удалить задачу', 'error')
        });
      }
    });
  }

  getPriorityClass(priority: string): string {
    if (priority === 'HIGH') return 'text-danger fw-bold';
    if (priority === 'MEDIUM') return 'text-warning fw-bold';
    return 'text-success fw-bold';
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'NEW': 'bg-primary',
      'IN_PROGRESS': 'bg-warning',
      'COMPLETED': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
  }
}