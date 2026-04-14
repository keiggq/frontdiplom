import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentDto } from '../../shared/models';

const API_DOCUMENTS = 'http://localhost:8080/api/documents';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any>(API_DOCUMENTS);
  }
  getById(id: number) {
    return this.http.get<DocumentDto>(`http://localhost:8080/api/documents/${id}`);
  }
  search(keyword: string) {
    return this.http.get<DocumentDto[]>(`${API_DOCUMENTS}/search?keyword=${keyword}`);
  }
  
  create(formData: FormData) {
    return this.http.post(API_DOCUMENTS, formData);
  }

  download(id: number) {
    return this.http.get(`${API_DOCUMENTS}/${id}/download`, { 
      responseType: 'blob' 
    });
  }
    // Обновление статуса документа
  updateStatus(documentId: number, status: string) {
    return this.http.patch(`${API_DOCUMENTS}/${documentId}/status?status=${status}`, {});
  }
}