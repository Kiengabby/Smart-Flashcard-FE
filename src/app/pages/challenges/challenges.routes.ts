import { Routes } from '@angular/router';

export const CHALLENGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./challenges.component').then(m => m.ChallengesComponent)
  }
];
