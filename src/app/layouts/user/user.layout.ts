import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
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
  currentYear = new Date().getFullYear();
  
  // User data - lấy từ TokenService
  currentUser = {
    name: '',
    avatar: ''
  };

  constructor(
    private tokenService: TokenService,
    private cardService: CardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadMenuData();
    this.updateActiveMenuItem();
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
      console.log('User started daily review session');
    }
  }

  // Menu items được thiết kế theo kế hoạch đồ án Smart Flashcard
  menuItems = [
    {
      title: 'Tổng quan',
      icon: 'dashboard',
      routerLink: '/app/dashboard',
      description: 'Xem tổng quan tiến độ học tập và thống kê cá nhân',
      isActive: true,
      badge: null as string | null
    },
    {
      title: 'Thư viện thẻ',
      icon: 'book',
      routerLink: '/app/deck-library',
      description: 'Quản lý và tạo mới các bộ thẻ học tập',
      isActive: false,
      badge: null as string | null // UC-02: Quản lý Bộ thẻ
    },
    {
      title: 'Ôn tập hàng ngày',
      icon: 'calendar',
      routerLink: '/app/daily-review',
      description: 'Ôn tập thẻ đã đến hạn theo thuật toán SM-2',
      isActive: false,
      badge: null as string | null, // UC-04: Core feature - SRS
      isHighPriority: true
    },
    {
      title: 'Cộng đồng',
      icon: 'team',
      routerLink: '/app/community',
      description: 'Tương tác, chia sẻ và thách đấu với cộng đồng',
      isActive: false,
      badge: null as string | null // UC-06, UC-07: Tương tác cộng đồng
    },
    {
      title: 'Thông tin tài khoản',
      icon: 'user',
      routerLink: '/app/profile',
      description: 'Quản lý thông tin cá nhân và cài đặt',
      isActive: false,
      badge: null as string | null // UC-01: Quản lý Tài khoản
    }
  ];
}


