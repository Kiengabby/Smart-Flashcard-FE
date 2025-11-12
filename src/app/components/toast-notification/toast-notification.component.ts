import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <div 
      *ngIf="visible" 
      class="toast-notification"
      [ngClass]="'toast-' + type"
      [@slideIn]>
      
      <div class="toast-content">
        <div class="toast-icon">
          <nz-icon 
            [nzType]="getIconType()" 
            [nzTheme]="type === 'warning' ? 'fill' : 'outline'">
          </nz-icon>
        </div>
        
        <div class="toast-text">
          <div class="toast-title" *ngIf="title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>
        
        <button 
          class="toast-close" 
          (click)="close()"
          *ngIf="showClose">
          <nz-icon nzType="close" nzTheme="outline"></nz-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-notification {
      position: fixed;
      top: 24px;
      right: 24px;
      min-width: 320px;
      max-width: 400px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-top: 2px;
    }

    .toast-text {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .toast-message {
      font-size: 13px;
      line-height: 1.5;
      opacity: 0.9;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      opacity: 0.7;
    }

    .toast-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Toast Types */
    .toast-success {
      background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      color: white;
    }

    .toast-success .toast-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .toast-error {
      background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
      color: white;
    }

    .toast-error .toast-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .toast-warning {
      background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
      color: white;
    }

    .toast-warning .toast-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .toast-info {
      background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
      color: white;
    }

    .toast-info .toast-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .toast-notification.slide-out {
      animation: slideOut 0.3s ease-in forwards;
    }
  `],
  animations: []
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() type: ToastType = 'info';
  @Input() title?: string;
  @Input() message: string = '';
  @Input() duration: number = 4000;
  @Input() showClose: boolean = true;
  @Input() visible: boolean = true;
  
  @Output() onClose = new EventEmitter<void>();

  private timeoutId?: number;

  ngOnInit() {
    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  close() {
    this.visible = false;
    this.onClose.emit();
  }

  getIconType(): string {
    switch (this.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'exclamation-circle';
      case 'info':
      default:
        return 'info-circle';
    }
  }
}
