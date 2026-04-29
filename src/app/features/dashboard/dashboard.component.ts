import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { TaskService } from '../../core/services/task.service';
import { CommentService } from '../../core/services/comment.service';
import { DocumentDto, TaskDto, CommentDto } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  currentUserName: string = 'Пользователь';
  today: string = new Date().toISOString().split('T')[0];

  // Основные показатели
  totalDocuments = 0;
  totalTasks = 0;
  activeTasks = 0;
  overdueTasksCount = 0;
  documentsUnderReview = 0;
  completedThisMonth = 0;

  // Данные для отображения
  overdueTasks: TaskDto[] = [];
  recentComments: CommentDto[] = [];
  expiringDocuments: DocumentDto[] = [];
  recentDocuments: DocumentDto[] = [];
  myActiveTasks: TaskDto[] = [];

  constructor(
    private documentService: DocumentService,
    private taskService: TaskService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Документы
    this.documentService.getAll().subscribe({
      next: (data: any) => {
        const docs: DocumentDto[] = Array.isArray(data) ? data : (data?.content || []);
        this.totalDocuments = docs.length;
        this.recentDocuments = docs.slice(0, 5);

        this.expiringDocuments = docs
          .filter((doc: DocumentDto) => doc.expiryDate && new Date(doc.expiryDate) < new Date(this.today))
          .sort((a: DocumentDto, b: DocumentDto) => 
            new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()
          )
          .slice(0, 5);
      },
      error: (err) => console.error('Ошибка загрузки документов', err)
    });

    // Задачи
    this.taskService.getAll().subscribe({
      next: (data: any) => {
        const tasks: TaskDto[] = Array.isArray(data) ? data : (data?.content || []);

        this.totalTasks = tasks.length;
        this.activeTasks = tasks.filter((t: TaskDto) => t.status !== 'COMPLETED').length;
        this.overdueTasksCount = tasks.filter((t: TaskDto) => 
          t.dueDate && t.dueDate < this.today && t.status !== 'COMPLETED'
        ).length;

        this.overdueTasks = tasks
          .filter((t: TaskDto) => t.dueDate && t.dueDate < this.today && t.status !== 'COMPLETED')
          .slice(0, 5);

        this.myActiveTasks = tasks
          .filter((t: TaskDto) => t.status !== 'COMPLETED')
          .slice(0, 5);
      },
      error: (err) => console.error('Ошибка загрузки задач', err)
    });

    // Комментарии
    this.commentService.getRecent(8).subscribe({
      next: (comments: CommentDto[]) => {
        this.recentComments = comments;
      },
      error: (err) => console.error('Ошибка загрузки комментариев', err)
    });
  }

  // Методы для шаблона
  getPriorityClass(priority: string): string {
    if (priority === 'HIGH') return 'bg-danger';
    if (priority === 'MEDIUM') return 'bg-warning';
    return 'bg-success';
  }

  getStatusName(status: string): string {
    const names: any = {
      'CREATED': 'Создан',
      'UNDER_REVIEW': 'На рассмотрении',
      'APPROVED': 'Утвержден',
      'REJECTED': 'Отклонен',
      'EXPIRED': 'Просрочен',
      'DRAFT': 'Черновик'
    };
    return names[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'CREATED': 'bg-primary',
      'UNDER_REVIEW': 'bg-warning',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger',
      'EXPIRED': 'bg-danger',
      'DRAFT': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }
}