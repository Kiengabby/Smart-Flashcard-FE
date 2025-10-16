import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule, NzMenuModule, NzIconModule],
  templateUrl: './guest.layout.html',
  styleUrls: ['./guest.layout.css']
})
export class GuestLayoutComponent { 
  currentYear = new Date().getFullYear();
}


