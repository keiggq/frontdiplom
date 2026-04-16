import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {

  currentUserName: string = 'Пользователь';
  currentUserId: number = 0;
  isAdmin: boolean = false;

  // Уведомления
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserName = user.fullName || user.username || 'Пользователь';
        this.currentUserId = user.id;
        this.isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';

        this.notificationService.notifications$.subscribe(allNotifications => {
          this.notifications = allNotifications.filter(notif => {
            // Если userId === null — уведомление для админа
            if (notif.userId === null) {
              return this.isAdmin;
            }
            // Если userId указан — уведомление для конкретного пользователя
            if (notif.userId) {
              return notif.userId === this.currentUserId;
            }
            // Если userId вообще не указан — показываем всем (старые уведомления)
            return true;
          });

          this.unreadCount = this.notifications.filter(n => !n.read).length;
        });
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}