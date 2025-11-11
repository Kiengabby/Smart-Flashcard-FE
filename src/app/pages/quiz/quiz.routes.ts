import { Routes } from '@angular/router';

export const QUIZ_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./quiz.component').then(m => m.QuizComponent)
  },
  {
    path: 'result',
    loadComponent: () => import('./quiz-result/quiz-result.component').then(m => m.QuizResultComponent)
  }
];