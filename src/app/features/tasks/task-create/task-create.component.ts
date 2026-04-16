import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskCreateDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-create.component.html'
})
export class TaskCreateComponent implements OnInit {

  task: TaskCreateDto = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: 0,
    documentId: null
  };

  users: any[] = [];           // список пользователей
  documents: any[] = [];       // список документов
  currentUserId: number = 0;
  isLoadingUsers = true;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUserId = user.id;
    });

    this.loadUsers();
    this.loadDocuments();
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки пользователей', err);
        this.isLoadingUsers = false;
        Swal.fire('Ошибка', 'Не удалось загрузить список пользователей', 'error');
      }
    });
  }

  loadDocuments() {
    this.documentService.getAll().subscribe({
      next: (data: any) => {
        this.documents = Array.isArray(data) ? data : (data?.content || []);
      },
      error: (err) => console.error('Ошибка загрузки документов', err)
    });
  }

  createTask() {
    if (!this.task.title || this.task.assigneeId === 0) {
      Swal.fire('Ошибка', 'Название задачи и исполнитель обязательны', 'error');
      return;
    }

    this.task.creatorId = this.currentUserId;

    this.taskService.create(this.task).subscribe({
      next: () => {
        Swal.fire('Успех', 'Задача успешно создана!', 'success');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        Swal.fire('Ошибка', err.error?.message || 'Не удалось создать задачу', 'error');
      }
    });
  }
  cancel() {
    this.router.navigate(['/tasks']);
  }
}