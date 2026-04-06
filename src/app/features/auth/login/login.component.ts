import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="fw-bold text-primary">DocFlow</h2>
                <p class="text-muted">Войдите в систему документооборота</p>
              </div>

              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label class="form-label">Имя пользователя</label>
                  <input type="text" 
                         class="form-control form-control-lg" 
                         [(ngModel)]="username" 
                         name="username"
                         placeholder="Введите имя пользователя"
                         required>
                </div>

                <div class="mb-4">
                  <label class="form-label">Пароль</label>
                  <input type="password" 
                         class="form-control form-control-lg" 
                         [(ngModel)]="password" 
                         name="password"
                         placeholder="Введите пароль"
                         required>
                </div>

                <button type="submit" 
                        class="btn btn-primary btn-lg w-100 mb-3"
                        [disabled]="isLoading">
                  {{ isLoading ? 'Вход...' : 'Войти' }}
                </button>
              </form>

              <div class="text-center">
                <p class="mb-0">
                  Нет аккаунта? 
                  <a routerLink="/register" class="text-primary">Зарегистрироваться</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  onLogin() {
    if (!this.username || !this.password) {
      Swal.fire('Ошибка', 'Введите имя пользователя и пароль', 'warning');
      return;
    }

    this.isLoading = true;

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Ошибка входа',
          text: err.error?.message || 'Неверные учетные данные',
          confirmButtonText: 'Понятно'
        });
      }
    });
  }
}