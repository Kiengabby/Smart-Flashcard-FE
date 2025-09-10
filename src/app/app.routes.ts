import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/onboarding' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'onboarding', loadChildren: () => import('./pages/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES) },
  { path: 'auth/login', loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES) },
  { path: 'auth/register', loadChildren: () => import('./pages/register/register.routes').then(m => m.REGISTER_ROUTES) },
  { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) }
];
