import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentDto, CommentCreateDto, DocumentDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-list.component.html'
})
export class CommentListComponent implements OnInit {

  comments: CommentDto[] = [];
  documents: DocumentDto[] = [];
  newCommentContent: string = '';
  selectedDocumentId: number | null = null;
  isSubmitting = false;
  currentUserId: number = 0;

  constructor(
    private commentService: CommentService,
    private documentService: DocumentService,
    private authService: AuthService
  ) {
    // Получаем ID текущего пользователя
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUserId = user.id;
    });
  }

  ngOnInit() {
    this.loadComments();
    this.loadDocuments();
  }

  loadComments() {
    this.commentService.getRecent(50).subscribe({
      next: (data) => this.comments = data,
      error: (err) => console.error(err)
    });
  }

  loadDocuments() {
    this.documentService.getAll().subscribe({
      next: (data) => {
        this.documents = Array.isArray(data) ? data : (data.content || []);
      },
      error: (err) => console.error('Ошибка загрузки документов', err)
    });
  }

  addComment() {
    if (!this.newCommentContent.trim() || !this.selectedDocumentId) {
      Swal.fire('Ошибка', 'Выберите документ и введите текст комментария', 'warning');
      return;
    }

    this.isSubmitting = true;

    const comment: CommentCreateDto = {
      content: this.newCommentContent,
      documentId: this.selectedDocumentId
    };

    this.commentService.create(comment).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.selectedDocumentId = null;
        this.loadComments();
        Swal.fire('Успех', 'Комментарий добавлен!', 'success');
        this.isSubmitting = false;
      },
      error: (err) => {
        Swal.fire('Ошибка', 'Не удалось добавить комментарий', 'error');
        this.isSubmitting = false;
      }
    });
  }

  // Удаление комментария (только своего)
  deleteComment(commentId: number, authorId: number) {
    if (authorId !== this.currentUserId) {
      Swal.fire('Ошибка', 'Вы можете удалить только свои комментарии', 'error');
      return;
    }

    Swal.fire({
      title: 'Вы уверены?',
      text: 'Комментарий будет удалён без возможности восстановления',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Отмена',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commentService.delete(commentId).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== commentId);
            Swal.fire('Удалено!', 'Комментарий успешно удалён', 'success');
          },
          error: () => Swal.fire('Ошибка', 'Не удалось удалить комментарий', 'error')
        });
      }
    });
  }
}