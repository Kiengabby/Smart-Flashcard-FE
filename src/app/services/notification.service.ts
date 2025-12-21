import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap, startWith } from 'rxjs/operators';
import { Notification } from '../interfaces/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  private pollingInterval = 30000; // 30 seconds

  // BehaviorSubject to track unread count
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // BehaviorSubject for notifications list
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  /**
   * Start polling for new notifications
   */
  private startPolling(): void {
    interval(this.pollingInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.getUnreadNotifications()),
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(notifications.length);
        })
      )
      .subscribe();
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Update local state
          const current = this.notificationsSubject.value;
          const updated = current.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          );
          this.notificationsSubject.next(updated);
          this.updateUnreadCount();
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {})
      .pipe(
        tap(() => {
          // Update local state
          const current = this.notificationsSubject.value;
          const updated = current.map(n => ({ ...n, isRead: true }));
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(0);
        })
      );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`)
      .pipe(
        tap(() => {
          // Update local state
          const current = this.notificationsSubject.value;
          const updated = current.filter(n => n.id !== notificationId);
          this.notificationsSubject.next(updated);
          this.updateUnreadCount();
        })
      );
  }

  /**
   * Update unread count from current notifications
   */
  private updateUnreadCount(): void {
    const current = this.notificationsSubject.value;
    const unread = current.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unread);
  }

  /**
   * Manually refresh notifications
   */
  refreshNotifications(): void {
    this.getUnreadNotifications().subscribe(notifications => {
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(notifications.length);
    });
  }
}
