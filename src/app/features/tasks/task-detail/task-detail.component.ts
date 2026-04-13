import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent implements OnInit {

  task: TaskDto | null = null;
  isLoading = true;
  today = new Date().toISOString().split('T')[0];   // ← Добавили это свойство

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(+id);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  loadTask(id: number) {
    this.isLoading = true;
    this.taskService.getById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.isLoading = false;
      },
      error: () => {
        Swal.fire('Ошибка', 'Задача не найдена', 'error');
        this.router.navigate(['/tasks']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }

  openDocument(documentId: number | undefined) {
    if (documentId) {
      this.router.navigate(['/documents', documentId]);
    }
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
}