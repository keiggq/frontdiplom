import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="fw-bold text-primary">DocFlow</h2>
                <p class="text-muted">Создание нового аккаунта</p>
              </div>

              <form (ngSubmit)="onRegister()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Имя пользователя *</label>
                    <input type="text" 
                           class="form-control" 
                           [(ngModel)]="form.username" 
                           name="username"
                           placeholder="Логин"
                           required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email *</label>
                    <input type="email" 
                           class="form-control" 
                           [(ngModel)]="form.email" 
                           name="email"
                           placeholder="your@email.com"
                           required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">ФИО *</label>
                  <input type="text" 
                         class="form-control" 
                         [(ngModel)]="form.fullName" 
                         name="fullName"
                         placeholder="Иванов Иван Иванович"
                         required>
                </div>

                <div class="mb-3">
                  <label class="form-label">Пароль * (минимум 6 символов)</label>
                  <input type="password" 
                         class="form-control" 
                         [(ngModel)]="form.password" 
                         name="password"
                         placeholder="Пароль"
                         required>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Должность</label>
                    <input type="text" 
                           class="form-control" 
                           [(ngModel)]="form.position" 
                           name="position"
                           placeholder="Менеджер">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Телефон</label>
                    <input type="text" 
                           class="form-control" 
                           [(ngModel)]="form.phone" 
                           name="phone"
                           placeholder="+7 (999) 123-45-67">
                  </div>
                </div>

                <button type="submit" 
                        class="btn btn-success btn-lg w-100 mb-3"
                        [disabled]="isLoading">
                  {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
                </button>
              </form>

              <div class="text-center">
                <p class="mb-0">
                  Уже есть аккаунт? 
                  <a routerLink="/login" class="text-primary">Войти</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: any = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    position: '',
    phone: ''
  };

  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.form.username || !this.form.email || !this.form.password || !this.form.fullName) {
      Swal.fire('Ошибка', 'Заполните обязательные поля', 'warning');
      return;
    }

    if (this.form.password.length < 6) {
      Swal.fire('Ошибка', 'Пароль должен быть не менее 6 символов', 'warning');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Регистрация успешна!',
          text: 'Теперь вы можете войти в систему',
          timer: 2500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'Не удалось зарегистрироваться. Попробуйте другое имя пользователя или email.';
        Swal.fire({
          icon: 'error',
          title: 'Ошибка регистрации',
          text: errorMsg,
          confirmButtonText: 'Понятно'
        });
      }
    });
  }
}