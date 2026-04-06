import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { TaskService } from '../../core/services/task.service';
import { CommentService } from '../../core/services/comment.service';
import { DocumentDto, TaskDto, CommentDto } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  totalDocuments = 0;
  totalTasks = 0;
  overdueTasks: TaskDto[] = [];
  recentComments: CommentDto[] = [];
  expiringDocuments: DocumentDto[] = [];

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

  getStatusClass(status: string): string {
    const map: any = {
      'CREATED': 'bg-primary',
      'APPROVED': 'bg-success',
      'UNDER_REVIEW': 'bg-warning',
      'EXPIRED': 'bg-danger',
      'REJECTED': 'bg-dark'
    };
    return map[status] || 'bg-secondary';
  }
}