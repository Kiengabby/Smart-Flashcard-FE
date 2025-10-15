import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

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
  styleUrls: ['./user-layout-simple.css']
})
export class UserLayoutComponent {
  isCollapsed = false;
  currentYear = new Date().getFullYear();
  
  // User data - trong thực tế sẽ lấy từ AuthService
  currentUser = {
    name: 'Kiên Gabby',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  };

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


