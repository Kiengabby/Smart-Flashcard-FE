import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth;
  private router: Router;

  constructor() {
    this.auth = inject(Auth);
    this.router = inject(Router);
  }

  // Đăng nhập bằng Email & Password
  async login({ email, password }: { email: string; password: string; }): Promise<UserCredential | void> {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful:', result.user.uid);
      await this.router.navigate(['/dashboard']);
      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = this.getFirebaseErrorMessage(error);
      alert(errorMessage);
      throw error;
    }
  }

  // Đăng ký bằng Email & Password
  async register({ email, password }: { email: string; password: string; }): Promise<UserCredential | void> {
    try {
      console.log('Attempting registration with:', { email, password: '***' });
      
      // Validate input before calling Firebase
      if (!email || !password) {
        throw new Error('Email và mật khẩu không được để trống');
      }
      
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Registration successful:', result.user.uid);
      await this.router.navigate(['/dashboard']);
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = this.getFirebaseErrorMessage(error);
      alert(errorMessage);
      throw error;
    }
  }

  // Đăng nhập bằng Google
  async loginWithGoogle(): Promise<UserCredential | void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      await this.router.navigate(['/dashboard']);
      return result;
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = this.getFirebaseErrorMessage(error);
      alert(errorMessage);
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      const errorMessage = this.getFirebaseErrorMessage(error);
      alert(errorMessage);
    }
  }

  // Xử lý Firebase error messages
  private getFirebaseErrorMessage(error: any): string {
    const code = error?.code || '';
    
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng. Vui lòng chọn email khác.';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
      case 'auth/invalid-email':
        return 'Email không hợp lệ. Vui lòng kiểm tra lại.';
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này.';
      case 'auth/wrong-password':
        return 'Mật khẩu không đúng. Vui lòng thử lại.';
      case 'auth/too-many-requests':
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      case 'auth/network-request-failed':
        return 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
      case 'auth/operation-not-allowed':
        return 'Chức năng này chưa được kích hoạt. Vui lòng liên hệ quản trị viên.';
      default:
        console.log('Unknown Firebase error code:', code);
        return error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
    }
  }
}
