import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';
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
        }),
        catchError((error: HttpErrorResponse) => {
          // Nếu không kết nối được server (ERR_CONNECTION_REFUSED)
          if (error.status === 0) {
            console.warn('Backend không khả dụng, sử dụng mock login...');
            return this.mockLogin(data);
          }
          return throwError(() => error);
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
        }),
        catchError((error: HttpErrorResponse) => {
          // Nếu không kết nối được server (ERR_CONNECTION_REFUSED)
          if (error.status === 0) {
            console.warn('Backend không khả dụng, sử dụng mock register...');
            return this.mockRegister(data);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Mock login cho development khi backend không chạy
   */
  private mockLogin(data: LoginRequest): Observable<AuthResponse> {
    // Simulate API delay
    return of({
      token: 'mock_jwt_token_' + Date.now(),
      user: {
        id: '1',
        email: data.email,
        displayName: 'Demo User',
        avatar: ''
      },
      message: 'Đăng nhập thành công (Mock Mode)'
    }).pipe(
      delay(1000), // Simulate network delay
      tap(response => {
        this.tokenService.saveToken(response.token);
        this.tokenService.saveUserInfo(response.user);
        console.info('Mock login successful for:', data.email);
      })
    );
  }

  /**
   * Mock register cho development khi backend không chạy
   */
  private mockRegister(data: RegisterRequest): Observable<AuthResponse> {
    // Simulate API delay
    return of({
      token: 'mock_jwt_token_' + Date.now(),
      user: {
        id: '1',
        email: data.email,
        displayName: data.displayName,
        avatar: ''
      },
      message: 'Đăng ký thành công (Mock Mode)'
    }).pipe(
      delay(1500), // Simulate network delay
      tap(response => {
        this.tokenService.saveToken(response.token);
        this.tokenService.saveUserInfo(response.user);
        console.info('Mock register successful for:', data.email);
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
