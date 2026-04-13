import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DocumentListComponent } from './features/documents/document-list/document-list.component';
import { DocumentCreateComponent } from './features/documents/document-create/document-create.component';
import { DocumentDetailComponent } from './features/documents/document-detail/document-detail.component';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';
import { TaskCreateComponent } from './features/tasks/task-create/task-create.component';
import { CommentListComponent } from './features/comments/comment-list/comment-list.component';
import { TaskDetailComponent } from './features/tasks/task-detail/task-detail.component';

export const routes: Routes = [
  // Публичные маршруты (без layout)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Защищенные маршруты (с layout)
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      
      // Документы
      { path: 'documents', component: DocumentListComponent },
      { path: 'documents/new', component: DocumentCreateComponent },
      { path: 'documents/:id', component: DocumentDetailComponent }, 
      
      // Задачи
      { path: 'tasks', component: TaskListComponent },
      { path: 'tasks/new', component: TaskCreateComponent },
      { path: 'tasks/:id', component: TaskDetailComponent },
      
      // Комментарии
      { path: 'comments', component: CommentListComponent }
    ]
  },

  // Перенаправление всех остальных маршрутов на логин
  { path: '**', redirectTo: '/login' }
];