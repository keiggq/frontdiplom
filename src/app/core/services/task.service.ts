import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskDto } from '../../shared/models';

const API_TASKS = 'http://localhost:8080/api/tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {

  constructor(private http: HttpClient) {}
  getMyTasks() {
    return this.http.get<any>('http://localhost:8080/api/tasks/my');
  }
  getAll() {
    return this.http.get<TaskDto[]>(API_TASKS);
  }

  getToday() {
    return this.http.get<TaskDto[]>(`${API_TASKS}/today`);
  }

  getOverdue() {
    return this.http.get<TaskDto[]>(`${API_TASKS}/overdue`);
  }

  create(task: any) {
    return this.http.post<TaskDto>(API_TASKS, task);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<TaskDto>(`${API_TASKS}/${id}/status?status=${status}`, {});
  }

  delete(id: number) {
    return this.http.delete(`${API_TASKS}/${id}`);
  }
}