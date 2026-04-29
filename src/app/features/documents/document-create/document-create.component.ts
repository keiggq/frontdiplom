import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-document-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-create.component.html'
})
export class DocumentCreateComponent implements OnInit {

  documentData: any = {
    title: '',
    description: '',
    documentDate: '',
    expiryDate: '',
    authorId: 0,           // будет заполнено автоматически
    documentTypeId: null,
    departmentId: null,
    keywords: ''
  };

  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.documentData.authorId = userId;
    } else {
      Swal.fire('Ошибка', 'Не удалось определить текущего пользователя', 'error');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  createDocument() {
    if (!this.documentData.title || !this.selectedFile) {
      Swal.fire('Ошибка', 'Название документа и файл обязательны', 'warning');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('document', new Blob([JSON.stringify(this.documentData)], { type: 'application/json' }));
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.documentService.create(formData).subscribe({
      next: (response: any) => {           // используем any, чтобы избежать ошибок типов
        this.isSubmitting = false;
        
        Swal.fire({
          title: 'Успех!',
          text: 'Документ успешно создан!',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });

        // Переходим на просмотр документа
        if (response && response.id) {
          this.router.navigate(['/documents', response.id]);
        } else {
          this.router.navigate(['/documents']); // fallback
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        Swal.fire('Ошибка', err.error?.message || 'Не удалось создать документ', 'error');
      }
    });
  }
  cancel() {
    this.router.navigate(['/documents']);
  }
}