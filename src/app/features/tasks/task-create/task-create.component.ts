import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-create.component.html'
})
export class TaskCreateComponent implements OnInit {

  task: any = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: null,
    documentId: null
  };

  isSubmitting = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.task.creatorId = userId;
    }

    // Проверка: если не админ — перенаправляем обратно
    if (!this.authService.isAdmin()) {
      Swal.fire({
        title: 'Доступ запрещён',
        text: 'Создавать задачи может только администратор',
        icon: 'error'
      });
      this.router.navigate(['/tasks']);
    }
  }

  createTask() {
    if (!this.task.title || !this.task.dueDate || !this.task.assigneeId) {
      Swal.fire('Ошибка', 'Заполните обязательные поля', 'warning');
      return;
    }

    this.isSubmitting = true;

    this.taskService.create(this.task).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire('Успех', 'Задача создана!', 'success');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Ошибка', err.error?.message || 'Не удалось создать задачу', 'error');
      }
    });
  }
}