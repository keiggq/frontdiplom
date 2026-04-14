import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
  taskId?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();

  private notificationCount = new BehaviorSubject<number>(0);
  notificationCount$ = this.notificationCount.asObservable();

  addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', taskId?: number) {
    const notification: Notification = {
      id: Date.now(),
      title,
      message,
      type,
      date: new Date(),
      read: false,
      taskId
    };

    const current = this.notifications.value;
    this.notifications.next([notification, ...current]);
    this.updateCount();
  }

  markAsRead(id: number) {
    const current = this.notifications.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.next(current);
    this.updateCount();
  }

  markAllAsRead() {
    const current = this.notifications.value.map(n => ({ ...n, read: true }));
    this.notifications.next(current);
    this.updateCount();
  }

  private updateCount() {
    const unread = this.notifications.value.filter(n => !n.read).length;
    this.notificationCount.next(unread);
  }

  clearAll() {
    this.notifications.next([]);
    this.notificationCount.next(0);
  }
}