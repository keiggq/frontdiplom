import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';


export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  date: Date;
  read: boolean;
  link?: string;
  taskId?: number;
  userId?: number | null        // ← Важное поле: кому предназначено уведомление
  extraData?: any;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();

  private count = new BehaviorSubject<number>(0);
  count$ = this.count.asObservable();
  

  // Добавляем userId в метод
  addNotification(
    title: string, 
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info', 
    taskId?: number,
    targetUserId?: number,   // null = всем, или конкретный ID
    extraData?: any
  ) {
    const notification: Notification = {
      id: Date.now(),
      title,
      message,
      type,
      date: new Date(),
      read: false,
      taskId,
      userId: targetUserId,
      extraData
    };

    const current = this.notifications.value;
    this.notifications.next([notification, ...current]);
    this.updateCount();
  }

  markAsRead(id: number) {
    const updated = this.notifications.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.next(updated);
    this.updateCount();
  }

  markAllAsRead() {
    const updated = this.notifications.value.map(n => ({ ...n, read: true }));
    this.notifications.next(updated);
    this.count.next(0);
  }

  private updateCount() {
    const unread = this.notifications.value.filter(n => !n.read).length;
    this.count.next(unread);
  }

  clearAll() {
    this.notifications.next([]);
    this.count.next(0);
  }

  // Получить уведомления только для конкретного пользователя
  getUserNotifications(userId: number): Notification[] {
    return this.notifications.value.filter(n => 
      !n.userId || n.userId === userId
    );
  }
  
}