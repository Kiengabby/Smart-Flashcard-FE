import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { LearningProgressService } from '../services/learning-progress.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Guard để bảo vệ các learning mode bị khóa
 * Chỉ cho phép truy cập mode nếu đã hoàn thành mode trước đó
 */
export const learningModeGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const learningProgressService = inject(LearningProgressService);
  const message = inject(NzMessageService);

  const deckId = Number(route.paramMap.get('id'));
  const currentPath = route.routeConfig?.path || '';

  // Map route path to learning mode
  const modeMap: { [key: string]: string } = {
    'study': 'flashcard',
    'quiz': 'quiz',
    'listening-practice': 'listening',
    'writing-practice': 'writing'
  };

  const mode = modeMap[currentPath];

  if (!mode || mode === 'flashcard') {
    // Flashcard mode is always accessible
    return true;
  }

  // Check if user can access this mode
  return learningProgressService.getDeckProgress(deckId).pipe(
    map(progress => {
      const canAccess = learningProgressService.canAccessMode(mode, progress);
      
      if (!canAccess) {
        message.warning('Bạn cần hoàn thành các chế độ trước đó để mở khóa chế độ này!');
        router.navigate(['/app/deck', deckId, 'learning-path']);
        return false;
      }
      
      return true;
    }),
    catchError(error => {
      console.error('Error checking mode access:', error);
      message.error('Không thể xác thực quyền truy cập');
      router.navigate(['/app/deck', deckId]);
      return of(false);
    })
  );
};
