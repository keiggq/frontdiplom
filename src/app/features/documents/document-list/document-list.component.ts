
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';        
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentDto, CommentDto, CommentCreateDto } from '../../../shared/models';


@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],   
  templateUrl: './document-list.component.html'
})
export class DocumentListComponent implements OnInit {
  documents: DocumentDto[] = [];
  searchTerm: string = '';
  today = new Date().toISOString().split('T')[0];

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getAll().subscribe({
      next: (data) => {
        this.documents = Array.isArray(data) ? data : (data.content || []);
      },
      error: (err) => console.error('Ошибка загрузки документов', err)
    });
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.loadDocuments();
      return;
    }

    this.documentService.search(this.searchTerm).subscribe({
      next: (data) => this.documents = data,
      error: (err) => console.error(err)
    });
  }

  downloadDocument(id: number, fileName: string) {
    this.documentService.download(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Ошибка скачивания', err)
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
}