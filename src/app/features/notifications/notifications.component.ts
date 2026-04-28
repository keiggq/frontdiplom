import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  currentUserId: number = 0;
  isAdmin: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';

        // Фильтрация уведомлений
        this.notificationService.notifications$.subscribe(allNotifications => {
          this.notifications = allNotifications.filter(notif => {

            // Уведомления с userId = null → предназначены только админу
            if (notif.userId === null) {
              return this.isAdmin;
            }

            // Уведомления с указанным userId → показываем только владельцу
            if (notif.userId !== undefined && notif.userId !== null) {
              return notif.userId === this.currentUserId;
            }

            // Старые уведомления без userId → показываем всем
            return true;
          });
        });
      }
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  clearAll() {
    this.notificationService.clearAll();
  }
}