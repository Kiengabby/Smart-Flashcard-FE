import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule],
  templateUrl: './auth.layout.html',
  styleUrls: ['./auth.layout.css']
})
export class AuthLayoutComponent { }


