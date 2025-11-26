import { Routes } from '@angular/router';

export const WRITING_PRACTICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./writing-practice.component').then(m => m.WritingPracticeComponent)
  }
];
