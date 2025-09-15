import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NzLayoutModule, NzIconModule, NzMenuModule],
  templateUrl: './user.layout.html',
  styleUrls: ['./user.layout.css']
})
export class UserLayoutComponent {
  isCollapsed = false;
  currentYear = new Date().getFullYear();
}


