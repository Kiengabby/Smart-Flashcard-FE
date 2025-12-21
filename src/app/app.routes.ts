import { Routes } from '@angular/router';
import { GuestLayoutComponent } from './layouts/guest/guest.layout';
import { AuthLayoutComponent } from './layouts/auth/auth.layout';
import { UserLayoutComponent } from './layouts/user/user.layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
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
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'daily-review', loadChildren: () => import('./pages/daily-review/daily-review.routes').then(m => m.dailyReviewRoutes) },
      { path: 'deck-library', loadChildren: () => import('./pages/deck-library/deck-library.routes').then(m => m.DECK_LIBRARY_ROUTES) },
      { path: 'deck/:id', loadChildren: () => import('./pages/deck-detail/deck-detail.routes').then(m => m.DECK_DETAIL_ROUTES) },
      { path: 'invitations', loadChildren: () => import('./pages/invitations/invitations.routes').then(m => m.INVITATIONS_ROUTES) },
      
      // 🏆 Arena Mode Routes
      { path: 'arena/lobby/:deckId', loadChildren: () => import('./pages/arena-lobby/arena-lobby.routes').then(m => m.ARENA_LOBBY_ROUTES) },
      { path: 'arena/game/:id', loadChildren: () => import('./pages/arena-game/arena-game.routes').then(m => m.ARENA_GAME_ROUTES) },
      { path: 'arena/result/:id', loadChildren: () => import('./pages/arena-result/arena-result.routes').then(m => m.ARENA_RESULT_ROUTES) },
      { path: 'arena/leaderboard/:deckId', loadChildren: () => import('./pages/arena-leaderboard/arena-leaderboard.routes').then(m => m.ARENA_LEADERBOARD_ROUTES) },
      
      { path: 'study-mode/:id', loadChildren: () => import('./pages/study-mode/study-mode.routes').then(m => m.STUDY_MODE_ROUTES) },
      { 
        path: 'study/:id', 
        children: [
          { path: 'flashcard', loadChildren: () => import('./pages/flashcard-study/flashcard-study.routes').then(m => m.FLASHCARD_STUDY_ROUTES) },
          { path: 'quiz', loadChildren: () => import('./pages/quiz/quiz.routes').then(m => m.QUIZ_ROUTES) },
          { path: 'listening', loadChildren: () => import('./pages/listening-practice/listening-practice.routes').then(m => m.LISTENING_PRACTICE_ROUTES) },
          { path: 'writing', loadChildren: () => import('./pages/writing-practice/writing-practice.routes').then(m => m.WRITING_PRACTICE_ROUTES) }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
