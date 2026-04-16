import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './document-list.component.html'
  
})
export class DocumentListComponent implements OnInit {

  documents: DocumentDto[] = [];
  activeTab: 'all' | 'DRAFT' | 'CREATED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' | 'EXPIRED' = 'all';
  isAdmin = false;
  currentUserId: number = 0;
  today = new Date().toISOString().split('T')[0];
  searchTerm: string = '';
  viewMode: 'kanban' | 'list' = 'kanban';

  constructor(
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
        this.loadDocuments();
      }
    });
  }
  get draftCount() { return this.documents.filter(d => d.status === 'DRAFT').length; }
  get underReviewCount() { return this.documents.filter(d => d.status === 'UNDER_REVIEW').length; }
  get approvedCount() { return this.documents.filter(d => d.status === 'APPROVED').length; }
  get rejectedCount() { return this.documents.filter(d => d.status === 'REJECTED').length; }
  get expiredCount() { return this.documents.filter(d => d.status === 'EXPIRED').length; }

  loadDocuments() {
    this.documentService.getAll().subscribe({
      next: (data: any) => {
        this.documents = Array.isArray(data) ? data : (data?.content || []);
      },
      error: (err) => console.error(err)
    });
  }

  setTab(tab: 'all' | 'DRAFT' | 'CREATED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' | 'EXPIRED') {
    this.activeTab = tab;
  }

  // Поиск в реальном времени
  search() {
    // Ничего не делаем — поиск работает автоматически через getFilteredDocuments()
  }

  getFilteredDocuments() {
    let filtered = this.documents;

    // Фильтрация по статусу (вкладки)
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(doc => doc.status === this.activeTab);
    }

    // Поиск по названию или номеру
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        (doc.title && doc.title.toLowerCase().includes(term)) ||
        (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  downloadDocument(id: number, fileName: string) {
    this.documentService.download(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Ошибка', 'Не удалось скачать файл', 'error')
    });
  }

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
  getDocumentsByStatus(status: string) {
    if (status === 'all') return this.documents;
    return this.documents.filter(doc => doc.status === status);
  }
}