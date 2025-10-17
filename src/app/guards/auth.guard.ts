import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Auth Guard - Bảo vệ routes yêu cầu đăng nhập
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Kiểm tra xem user đã đăng nhập chưa
  const isLoggedIn = tokenService.hasToken() && !tokenService.isTokenExpired();

  if (!isLoggedIn) {
    // Chuyển hướng về trang login và lưu URL đích
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  return true;
};


