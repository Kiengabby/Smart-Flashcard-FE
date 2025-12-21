import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  console.log('🔐 Auth Interceptor Debug:', {
    url: req.url,
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenExpired: tokenService.isTokenExpired()
  });

  // Nếu có token, thêm header Authorization
  if (token && !tokenService.isTokenExpired()) {
    console.log('✅ Adding Authorization header with valid token');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  } else if (token && tokenService.isTokenExpired()) {
    console.warn('⚠️ Token expired, not adding Authorization header');
  } else {
    console.warn('⚠️ No token found, not adding Authorization header');
  }

  return next(req);
};
