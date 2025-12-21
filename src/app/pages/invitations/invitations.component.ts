import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';
import { Invitation, InvitationStatus } from '../../interfaces/invitation.model';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzAvatarModule,
    NzEmptyModule,
    NzSpinModule,
    NzModalModule
  ],
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent implements OnInit, OnDestroy {
  invitations: Invitation[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  // For template access
  InvitationStatus = InvitationStatus;

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private message: NzMessageService,
    private modal: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Invitations component initialized');
    this.loadInvitations();
    
    // Reload when navigating to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('🔄 Route changed, reloading invitations');
        this.loadInvitations();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvitations(): void {
    this.isLoading = true;
    this.invitationService.getMyInvitations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invitations) => {
          console.log('📬 Received invitations in component:', invitations);
          this.invitations = invitations;
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (error) => {
          console.error('❌ Error loading invitations:', error);
          this.invitations = [];
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
          this.message.warning('Chưa có lời mời nào hoặc không thể kết nối đến server');
        }
      });
  }

  acceptInvitation(invitation: Invitation): void {
    this.modal.confirm({
      nzTitle: 'Chấp nhận lời mời',
      nzContent: `Bạn có muốn tham gia học cùng bộ thẻ "<strong>${invitation.deck.name}</strong>" không?`,
      nzOkText: 'Tham gia',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.invitationService.respondToInvitation(invitation.id, true)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              // Wrap in setTimeout to avoid Expression Changed error
              setTimeout(() => {
                this.message.success('Đã tham gia bộ thẻ thành công! 🎉');
              }, 0);
              
              // Reload current page's invitations list  
              this.loadInvitations();
              
              // 🔥 Add delay to ensure backend transaction is committed
              setTimeout(() => {
                // Navigate to deck library with the new deck highlighted
                this.router.navigate(['/app/deck-library'], {
                  queryParams: { 
                    highlight: invitation.deck.id,
                    message: `Bạn đã tham gia bộ thẻ "${invitation.deck.name}"`,
                    refresh: new Date().getTime() // Add timestamp to force reload
                  }
                });
              }, 1000); // Wait 1 second for database commit
            },
            error: (error) => {
              console.error('Error accepting invitation:', error);
              this.message.error('Có lỗi xảy ra khi chấp nhận lời mời');
            }
          });
      }
    });
  }

  rejectInvitation(invitation: Invitation): void {
    this.modal.confirm({
      nzTitle: 'Từ chối lời mời',
      nzContent: `Bạn có chắc muốn từ chối lời mời học cùng bộ thẻ "<strong>${invitation.deck.name}</strong>" không?`,
      nzOkText: 'Từ chối',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.invitationService.respondToInvitation(invitation.id, false)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.message.info('Đã từ chối lời mời');
              this.loadInvitations();
            },
            error: (error) => {
              console.error('Error rejecting invitation:', error);
              this.message.error('Có lỗi xảy ra khi từ chối lời mời');
            }
          });
      }
    });
  }

  getStatusColor(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'orange';
      case InvitationStatus.ACCEPTED:
        return 'green';
      case InvitationStatus.REJECTED:
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusText(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'Chờ phản hồi';
      case InvitationStatus.ACCEPTED:
        return 'Đã chấp nhận';
      case InvitationStatus.REJECTED:
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d',
      '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const invitationDate = new Date(date);
    const diffMs = now.getTime() - invitationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return invitationDate.toLocaleDateString('vi-VN');
  }

  getPendingCount(): number {
    return this.invitations.filter(inv => inv.status === InvitationStatus.PENDING).length;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
