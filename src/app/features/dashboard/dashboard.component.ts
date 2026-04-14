import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { TaskService } from '../../core/services/task.service';
import { CommentService } from '../../core/services/comment.service';
import { RouterLink } from '@angular/router';
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
  totalDocuments = 0;
  totalTasks = 0;
  overdueTasks: TaskDto[] = [];
  recentComments: CommentDto[] = [];
  expiringDocuments: DocumentDto[] = [];
  activeTasks = 0;
  documentsUnderReview = 0;
  completedThisMonth = 0;
  documentsGrowth = 0;
  myActiveTasks: any[] = [];
  recentDocuments: any[] = [];

  constructor(
    private documentService: DocumentService,
    private taskService: TaskService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Общее количество документов
    this.documentService.getAll().subscribe(data => {
      this.totalDocuments = Array.isArray(data) ? data.length : (data.content?.length || 0);
    });

    // Общее количество задач
    this.taskService.getAll().subscribe(tasks => {
      this.totalTasks = tasks.length;
    });

    // Просроченные задачи
    this.taskService.getOverdue().subscribe(tasks => {
      this.overdueTasks = tasks.slice(0, 5);
    });

    // Последние комментарии
    this.commentService.getRecent(8).subscribe(comments => {
      this.recentComments = comments;
    });

    // Документы (для отображения истекающих)
    this.documentService.getAll().subscribe(data => {
      const allDocs = Array.isArray(data) ? data : (data.content || []);
      this.expiringDocuments = allDocs
        .filter((doc: any) => doc.expiryDate)
        .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
        .slice(0, 5);
    });
  }
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
    'EXPIRED': 'Просрочен'
  };
  return names[status] || status;
}

getStatusClass(status: string): string {
  const classes: any = {
    'CREATED': 'bg-primary',
    'UNDER_REVIEW': 'bg-warning',
    'APPROVED': 'bg-success',
    'REJECTED': 'bg-danger',
    'EXPIRED': 'bg-danger'
  };
  return classes[status] || 'bg-secondary';
}
  
}