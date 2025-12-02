import { Routes } from '@angular/router';
import { DeckDetailComponent } from './deck-detail.component';
import { learningModeGuard } from '../../guards/learning-mode.guard';

export const DECK_DETAIL_ROUTES: Routes = [
  {
    path: '',
    component: DeckDetailComponent
  },
  {
    path: 'learning-path',
    loadChildren: () => import('../learning-path/learning-path.routes').then(m => m.LEARNING_PATH_ROUTES)
  },
  {
    path: 'study',
    loadChildren: () => import('../flashcard-study/flashcard-study.routes').then(m => m.FLASHCARD_STUDY_ROUTES),
    canActivate: [learningModeGuard]
  },
  {
    path: 'quiz',
    loadChildren: () => import('../quiz/quiz.routes').then(m => m.QUIZ_ROUTES),
    canActivate: [learningModeGuard]
  },
  {
    path: 'listening-practice',
    loadChildren: () => import('../listening-practice/listening-practice.routes').then(m => m.LISTENING_PRACTICE_ROUTES),
    canActivate: [learningModeGuard]
  },
  {
    path: 'writing-practice',
    loadChildren: () => import('../writing-practice/writing-practice.routes').then(m => m.WRITING_PRACTICE_ROUTES),
    canActivate: [learningModeGuard]
  }
];


