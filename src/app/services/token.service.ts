import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_INFO_KEY = 'user_info';

  constructor() { }

  /**
   * Lưu token vào localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Lấy token từ localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Lưu refresh token vào localStorage
   */
  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Lấy refresh token từ localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Lưu thông tin user vào localStorage
   */
  saveUserInfo(userInfo: any): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }

  /**
   * Lấy thông tin user từ localStorage
   */
  getUserInfo(): any {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Xóa tất cả token và thông tin user
   */
  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  /**
   * Kiểm tra xem có token hay không
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Kiểm tra token có hết hạn hay không (cần decode JWT)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
