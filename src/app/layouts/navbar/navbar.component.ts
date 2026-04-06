import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" routerLink="/dashboard">📄 DocFlow</a>
        
        <div class="navbar-nav ms-auto align-items-center">
          <span class="navbar-text me-3 text-light">
            {{ currentUser?.fullName }}
          </span>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">
            Выйти
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser: any = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}