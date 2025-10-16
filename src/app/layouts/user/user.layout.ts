import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    RouterOutlet, 
    NzLayoutModule, 
    NzIconModule, 
    NzMenuModule,
    NzAvatarModule,
    NzTypographyModule
  ],
  templateUrl: './user.layout.html',
  styleUrls: ['./user-layout-fixed.css']
})
export class UserLayoutComponent implements OnInit {
  isCollapsed = false;
  currentYear = new Date().getFullYear();
  
  // User data - lấy từ TokenService
  currentUser = {
    name: '',
    avatar: ''
  };

  constructor(private tokenService: TokenService) {}

  ngOnInit(): void {
    this.loadUserInfo();
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

  // Menu items với icons hiện đại
  menuItems = [
    {
      title: 'Bảng điều khiển',
      icon: 'dashboard',
      routerLink: '/dashboard',
      isActive: true
    },
    {
      title: 'Ôn tập',
      icon: 'read',
      routerLink: '/review'
    },
    {
      title: 'Bảng xếp hạng',
      icon: 'trophy',
      routerLink: '/leaderboard'
    },
    {
      title: 'Cài đặt',
      icon: 'setting',
      routerLink: '/settings'
    }
  ];
}


