import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { TaskService } from '../../../core/services/task.service';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentDto, TaskDto, CommentDto, CommentCreateDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-detail.component.html'
})
export class DocumentDetailComponent implements OnInit {

  document: DocumentDto | null = null;
  comments: CommentDto[] = [];
  relatedTasks: TaskDto[] = [];
  newCommentContent: string = '';
  isLoading = true;
  isAdmin = false;
  currentUserId: number = 0;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private taskService: TaskService,
    private commentService: CommentService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(+id);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  loadDocument(id: number) {
    this.isLoading = true;
    this.documentService.getById(id).subscribe({
      next: (doc) => {
        this.document = doc;
        this.loadComments(id);
        if (this.isAdmin) {
          this.loadRelatedTasks(id);
        }
      },
      error: () => {
        Swal.fire('Ошибка', 'Документ не найден', 'error');
        this.router.navigate(['/documents']);
      }
    });
  }

  loadComments(documentId: number) {
    this.commentService.getByDocument(documentId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadRelatedTasks(documentId: number) {
    this.taskService.getByDocument(documentId).subscribe({
      next: (tasks) => {
        this.relatedTasks = tasks;
      },
      error: (err) => console.error('Не удалось загрузить связанные задачи', err)
    });
  }

  addComment() {
    if (!this.newCommentContent.trim() || !this.document) return;

    const comment: CommentCreateDto = {
      content: this.newCommentContent,
      documentId: this.document.id
    };

    this.commentService.create(comment).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.loadComments(this.document!.id);
        Swal.fire('Успех', 'Комментарий добавлен!', 'success');
      },
      error: (err) => Swal.fire('Ошибка', err.error?.message || 'Не удалось добавить комментарий', 'error')
    });
  }

  // Обновление статуса документа (только для админа)
  updateDocumentStatus(newStatus: string) {
    if (!this.document || !this.isAdmin) return;

    this.documentService.updateStatus(this.document.id, newStatus).subscribe({
      next: () => {
        this.document!.status = newStatus;
        Swal.fire('Статус обновлён', '', 'success');
      },
      error: (err) => Swal.fire('Ошибка', err.error?.message || 'Не удалось обновить статус', 'error')
    });
  }

  updateTaskStatus(taskId: number, newStatus: string) {
    if (!this.isAdmin) return;

    this.taskService.updateStatus(taskId, newStatus).subscribe({
      next: () => {
        Swal.fire('Статус задачи обновлён', '', 'success');
        this.loadRelatedTasks(this.document!.id);
      },
      error: (err) => Swal.fire('Ошибка', 'Не удалось обновить статус задачи', 'error')
    });
  }

  downloadFile() {
    if (!this.document) return;
    
    this.documentService.download(this.document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document!.fileName || 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Ошибка', 'Не удалось скачать файл', 'error')
    });
  }

  goBack() {
    this.router.navigate(['/documents']);
  }

  // ==================== Русские статусы ====================
  getStatusName(status: string): string {
    const names: any = {
      'DRAFT': 'Черновик',
      'CREATED': 'Создан',
      'UNDER_REVIEW': 'На рассмотрении',
      'APPROVED': 'Утвержден',
      'REJECTED': 'Отклонен',
      'ARCHIVED': 'В архиве',
      'EXPIRED': 'Просрочен'
    };
    return names[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'DRAFT': 'bg-secondary',
      'CREATED': 'bg-primary',
      'UNDER_REVIEW': 'bg-warning',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger',
      'ARCHIVED': 'bg-dark',
      'EXPIRED': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getExecutorStatusName(status: string): string {
    const names: any = { 'NEW': 'Новая', 'IN_PROGRESS': 'В работе', 'COMPLETED': 'Выполнено' };
    return names[status] || status;
  }

  getExecutorStatusClass(status: string): string {
    const classes: any = { 'NEW': 'bg-primary', 'IN_PROGRESS': 'bg-warning', 'COMPLETED': 'bg-success' };
    return classes[status] || 'bg-secondary';
  }

  getAdminStatusName(status: string): string {
    const names: any = { 'IN_REVIEW': 'В обработке', 'AGREED': 'Согласовано', 'REVISION': 'На доработку' };
    return names[status] || status;
  }

  getAdminStatusClass(status: string): string {
    const classes: any = { 'IN_REVIEW': 'bg-info', 'AGREED': 'bg-success', 'REVISION': 'bg-danger' };
    return classes[status] || 'bg-secondary';
  }
}