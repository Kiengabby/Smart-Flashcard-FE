import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { TokenService } from '../../services/token.service';
import { CardService } from '../../services/card.service';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    RouterOutlet, 
    NzLayoutModule, 
    NzIconModule, 
    NzMenuModule,
    NzAvatarModule,
    NzTypographyModule,
    NzBadgeModule,
    NzToolTipModule
  ],
  templateUrl: './user.layout.html',
  styleUrls: ['./user-layout-enhanced.css']
})
export class UserLayoutComponent implements OnInit {
  isCollapsed = false;
  isMiniMode = false;
  sidebarWidth = 280; // Default width
  isResizing = false;
  currentYear = new Date().getFullYear();
  pendingInvitationsCount = 0;
  
  // User data - lấy từ TokenService
  currentUser = {
    name: '',
    avatar: ''
  };

  constructor(
    private tokenService: TokenService,
    private cardService: CardService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadMenuData();
    this.updateActiveMenuItem();
    this.loadInvitationsCount();
    this.subscribeToNotifications();
    this.updateSidebarMode();
  }

  /**
   * Handle mouse down for resizing
   */
  startResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    const startX = event.clientX;
    const startWidth = this.sidebarWidth;
    let animationFrameId: number;
    let lastMoveTime = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!this.isResizing) return;
      
      // Throttle mousemove events để giảm lag
      const now = Date.now();
      if (now - lastMoveTime < 16) return; // ~60fps
      lastMoveTime = now;
      
      // Cancel previous animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        const newWidth = startWidth + (e.clientX - startX);
        
        // Constrain width between min and max
        if (newWidth >= 60 && newWidth <= 400) {
          this.sidebarWidth = newWidth;
          this.updateSidebarMode();
        }
      });
    };
    
    const handleMouseUp = () => {
      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  /**
   * Update sidebar mode based on width
   */
  updateSidebarMode(): void {
    const oldMiniMode = this.isMiniMode;
    const oldCollapsed = this.isCollapsed;
    
    if (this.sidebarWidth <= 80) {
      this.isMiniMode = true;
      this.isCollapsed = false;
    } else if (this.sidebarWidth <= 200) {
      this.isMiniMode = false;
      this.isCollapsed = true;
    } else {
      this.isMiniMode = false;
      this.isCollapsed = false;
    }
    
    // Chỉ trigger change detection khi có thay đổi thực sự
    if (oldMiniMode !== this.isMiniMode || oldCollapsed !== this.isCollapsed) {
      this.cdr.detectChanges();
    }
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    if (this.isMiniMode) {
      // From mini mode to expanded
      this.sidebarWidth = 280;
      this.isMiniMode = false;
      this.isCollapsed = false;
    } else if (this.isCollapsed) {
      // From collapsed to expanded
      this.sidebarWidth = 280;
      this.isCollapsed = false;
    } else {
      // From expanded to collapsed
      this.sidebarWidth = 80;
      this.isCollapsed = true;
    }
    
    this.updateSidebarMode();
  }

  loadUserInfo(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.currentUser.name = userInfo.displayName || userInfo.email;
      this.currentUser.avatar = userInfo.avatar || this.getDefaultAvatar(userInfo.displayName || userInfo.email);
    }
  }

  getDefaultAvatar(name: string): string {
    // Generate avatar URL based on user's name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=128`;
  }

  /**
   * Load dữ liệu động cho menu (số thẻ cần ôn tập, notifications, etc.)
   */
  loadMenuData(): void {
    // Cập nhật badge cho "Ôn tập hàng ngày"
    this.cardService.getStudyStats().subscribe({
      next: (stats) => {
        const dailyReviewItem = this.menuItems.find(item => item.routerLink === '/app/daily-review');
        if (dailyReviewItem && stats.dueCards > 0) {
          dailyReviewItem.badge = stats.dueCards.toString();
        } else if (dailyReviewItem) {
          dailyReviewItem.badge = null; // Ẩn badge nếu không có thẻ cần ôn
        }
      },
      error: (error) => {
        console.warn('Could not load study stats for menu:', error);
      }
    });
  }

  /**
   * Load số lượng lời mời chờ phản hồi
   */
  loadInvitationsCount(): void {
    this.invitationService.getPendingCount().subscribe({
      next: (count) => {
        // 🔥 Fix NG0100: Wrap in setTimeout để avoid expression changed error
        setTimeout(() => {
          this.pendingInvitationsCount = count;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.warn('Could not load pending invitations count:', error);
        // Set to 0 on error to prevent crash
        setTimeout(() => {
          this.pendingInvitationsCount = 0;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  /**
   * Subscribe to notification updates để cập nhật real-time
   */
  subscribeToNotifications(): void {
    this.notificationService.unreadCount$.subscribe({
      next: (count) => {
        // Update invitation count when notifications change
        this.loadInvitationsCount();
      }
    });
  }

  /**
   * Cập nhật trạng thái active của menu items dựa trên route hiện tại
   */
  updateActiveMenuItem(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      item.isActive = currentUrl.includes(item.routerLink.replace('/app', ''));
    });
  }

  /**
   * Xử lý click vào menu item
   */
  onMenuItemClick(item: any): void {
    // Cập nhật trạng thái active
    this.menuItems.forEach(menuItem => menuItem.isActive = false);
    item.isActive = true;

    // Navigate đến route
    this.router.navigate([item.routerLink]);

    // Special handling cho một số route đặc biệt
    if (item.routerLink === '/app/daily-review') {
      // Có thể thêm analytics tracking
    }
  }

  // Menu items được thiết kế theo kế hoạch đồ án Smart Flashcard
  menuItems = [
    {
      title: 'Tổng quan',
      icon: 'fa-chart-line',
      routerLink: '/app/dashboard',
      description: 'Xem tổng quan tiến độ học tập và thống kê cá nhân',
      isActive: true,
      badge: null as string | null
    },
    {
      title: 'Thư viện thẻ',
      icon: 'fa-layer-group',
      routerLink: '/app/deck-library',
      description: 'Quản lý và tạo mới các bộ thẻ học tập',
      isActive: false,
      badge: null as string | null // UC-02: Quản lý Bộ thẻ
    },
    {
      title: 'Ôn tập hàng ngày',
      icon: 'fa-fire',
      routerLink: '/app/daily-review',
      description: 'Ôn tập thẻ đã đến hạn theo thuật toán SM-2',
      isActive: false,
      badge: null as string | null, // UC-04: Core feature - SRS
      isHighPriority: true
    },
    {
      title: 'Lời mời học tập',
      icon: 'fa-envelope-open-text',
      routerLink: '/app/invitations',
      description: 'Quản lý lời mời tham gia bộ thẻ từ bạn bè',
      isActive: false,
      badge: null as string | null, // UC-06: Social Learning
      badgeGetter: () => this.pendingInvitationsCount > 0 ? this.pendingInvitationsCount.toString() : null
    },
    {
      title: 'Cộng đồng',
      icon: 'fa-trophy',
      routerLink: '/app/community',
      description: 'Tương tác, chia sẻ và thách đấu với cộng đồng',
      isActive: false,
      badge: null as string | null // UC-06, UC-07: Tương tác cộng đồng
    },
    {
      title: 'Thông tin tài khoản',
      icon: 'fa-user-ninja',
      routerLink: '/app/profile',
      description: 'Quản lý thông tin cá nhân và cài đặt',
      isActive: false,
      badge: null as string | null // UC-01: Quản lý Tài khoản
    }
  ];
}


