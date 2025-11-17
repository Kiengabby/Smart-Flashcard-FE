import { Routes } from '@angular/router';

export const LISTENING_PRACTICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./listening-practice.component').then(m => m.ListeningPracticeComponent)
  }
];