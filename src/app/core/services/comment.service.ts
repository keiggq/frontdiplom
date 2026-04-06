import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommentDto, CommentCreateDto } from '../../shared/models';

const API_COMMENTS = 'http://localhost:8080/api/comments';

@Injectable({ providedIn: 'root' })
export class CommentService {

  constructor(private http: HttpClient) {}

  getRecent(limit: number = 15) {
    return this.http.get<CommentDto[]>(`${API_COMMENTS}/recent?limit=${limit}`);
  }

  create(comment: CommentCreateDto) {
    return this.http.post<CommentDto>(API_COMMENTS, comment);
  }
  getByDocument(documentId: number) {
    return this.http.get<CommentDto[]>(`${API_COMMENTS}/document/${documentId}`);
  }
  delete(id: number) {
    return this.http.delete(`${API_COMMENTS}/${id}`);
  }
}