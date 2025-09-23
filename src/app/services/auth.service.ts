import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_API = 'http://localhost:8080/api/auth/';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  /**
   * Đăng nhập người dùng
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.AUTH_API + 'login', data)
      .pipe(
        tap(response => {
          // Lưu token và thông tin user vào localStorage
          this.tokenService.saveToken(response.token);
          if (response.refreshToken) {
            this.tokenService.saveRefreshToken(response.refreshToken);
          }
          this.tokenService.saveUserInfo(response.user);
        })
      );
  }

  /**
   * Đăng ký người dùng mới
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.AUTH_API + 'register', data)
      .pipe(
        tap(response => {
          // Lưu token và thông tin user vào localStorage
          this.tokenService.saveToken(response.token);
          if (response.refreshToken) {
            this.tokenService.saveRefreshToken(response.refreshToken);
          }
          this.tokenService.saveUserInfo(response.user);
        })
      );
  }

  /**
   * Đăng xuất người dùng
   */
  logout(): Observable<any> {
    return this.http.post(this.AUTH_API + 'logout', {})
      .pipe(
        tap(() => {
          // Xóa tất cả token và thông tin user
          this.tokenService.clearTokens();
        })
      );
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<AuthResponse>(this.AUTH_API + 'refresh', { refreshToken })
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.token);
          if (response.refreshToken) {
            this.tokenService.saveRefreshToken(response.refreshToken);
          }
        })
      );
  }

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  isLoggedIn(): boolean {
    return this.tokenService.hasToken() && !this.tokenService.isTokenExpired();
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser(): any {
    return this.tokenService.getUserInfo();
  }

  /**
   * Quên mật khẩu
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(this.AUTH_API + 'forgot-password', { email });
  }

  /**
   * Reset mật khẩu
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(this.AUTH_API + 'reset-password', { token, newPassword });
  }
}
