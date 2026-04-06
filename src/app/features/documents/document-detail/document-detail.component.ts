import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentDto, CommentDto, CommentCreateDto } from '../../../shared/models';
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
  newCommentContent: string = '';
  isLoading = true;
  currentUserId: number = 0;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private commentService: CommentService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUserId = user.id;
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
        this.comments = comments;        // ← должно быть массив, а не Page
        this.isLoading = false;
        },
        error: (err) => {
        console.error(err);
        this.isLoading = false;
        }
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
        // Перезагружаем все комментарии, чтобы гарантированно получить authorPosition
        this.loadComments(this.document!.id);
        Swal.fire('Успех', 'Комментарий добавлен!', 'success');
        },
        error: (err) => {
        Swal.fire('Ошибка', err.error?.message || 'Не удалось добавить комментарий', 'error');
        }
    });
    }


  downloadFile() {
    if (!this.document) return;
    
    this.documentService.download(this.document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document!.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Ошибка', 'Не удалось скачать файл', 'error')
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'CREATED': 'bg-primary',
      'APPROVED': 'bg-success',
      'UNDER_REVIEW': 'bg-warning',
      'EXPIRED': 'bg-danger',
      'REJECTED': 'bg-dark',
      'ARCHIVED': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }
  goBack() {
    this.router.navigate(['/documents']);
  }
}