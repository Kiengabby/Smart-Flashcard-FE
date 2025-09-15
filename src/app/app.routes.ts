import { Routes } from '@angular/router';
import { GuestLayoutComponent } from './layouts/guest/guest.layout';
import { AuthLayoutComponent } from './layouts/auth/auth.layout';
import { UserLayoutComponent } from './layouts/user/user.layout';

export const routes: Routes = [
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'onboarding' },
      { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
      { path: 'onboarding', loadChildren: () => import('./pages/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES) }
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES) },
      { path: 'register', loadChildren: () => import('./pages/register/register.routes').then(m => m.REGISTER_ROUTES) }
    ]
  },
  {
    path: 'app',
    component: UserLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) }
    ]
  },
  { path: '**', redirectTo: '' }
];
