import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import Swal from 'sweetalert2';
import type { JwtResponse, LoginRequest, SignupRequest } from '../../shared/models';

const API_AUTH = 'http://localhost:8080/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<JwtResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal(false);
  public currentRole = signal<string>('');

  constructor() {
    this.loadFromStorage();
  }

  login(credentials: LoginRequest) {
    return this.http.post<JwtResponse>(`${API_AUTH}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(request: SignupRequest) {
    return this.http.post(`${API_AUTH}/signup`, request);
  }

  private setSession(res: JwtResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('currentUser', JSON.stringify(res));

    this.currentUserSubject.next(res);
    this.isAuthenticated.set(true);
    this.currentRole.set(res.role);

    Swal.fire({
      icon: 'success',
      title: 'Добро пожаловать!',
      text: `Здравствуйте, ${res.fullName}`,
      timer: 1800,
      showConfirmButton: false
    });

    this.router.navigate(['/dashboard']);
  }

  logout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private loadFromStorage() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr) as JwtResponse;
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
      this.currentRole.set(user.role);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') : false;
  }
  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  getCurrentUser(): JwtResponse | null {
    return this.currentUserSubject.value;
  }
}