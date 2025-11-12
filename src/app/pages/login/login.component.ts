import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Khởi tạo reactive form với validation
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  /**
   * Xử lý submit form đăng nhập
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;

    // Gọi API đăng nhập
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          // Kiểm tra nếu đang dùng mock mode
          if (response.message && response.message.includes('Mock Mode')) {
            this.notification.warning(
              'Demo Mode',
              'Đăng nhập thành công (Demo Mode - Backend chưa chạy)',
              {
                nzDuration: 4000
              }
            );
          } else {
            this.showLoginSuccess();
          }
          
          // Điều hướng đến dashboard sau khi đăng nhập thành công
          this.router.navigate(['/app/dashboard']);
        }, 0);
      },
      error: (error) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          // Xử lý lỗi với notification service
          this.handleApiError(error);
          
          console.error('Login error:', error);
          
          // Reset form validation để có thể submit lại
          this.loginForm.markAsUntouched();
          
          // Clear password field for security
          this.loginForm.patchValue({ password: '' });
        }, 0);
      }
    });
  }

  /**
   * Đánh dấu tất cả fields đã được touched để hiển thị lỗi
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Toggle hiển thị/ẩn mật khẩu
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Đăng nhập bằng Google
   * TODO: Tích hợp Firebase Google Auth
   */
  loginWithGoogle(): void {
    if (this.isLoading) return;
    
    console.log('Đăng nhập bằng Google');
    // TODO: Implement Google authentication
    // this.authService.loginWithGoogle()
  }

  /**
   * Đăng nhập bằng Facebook
   * TODO: Tích hợp Firebase Facebook Auth
   */
  loginWithFacebook(): void {
    if (this.isLoading) return;
    
    console.log('Đăng nhập bằng Facebook');
    // TODO: Implement Facebook authentication
    // this.authService.loginWithFacebook()
  }

  /**
   * Xử lý quên mật khẩu
   * TODO: Điều hướng đến trang reset password
   */
  forgotPassword(): void {
    console.log('Quên mật khẩu');
    // TODO: Navigate to forgot password page
    // this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Điều hướng đến trang đăng ký
   */
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Kiểm tra field có lỗi và đã được touched không
   */
  hasFieldError(fieldName: string, errorType?: string): boolean {
    const field = this.loginForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && field.touched;
    }
    
    return field.invalid && field.touched;
  }

  /**
   * Lấy thông báo lỗi cho field
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      switch (fieldName) {
        case 'email': return 'Email là bắt buộc';
        case 'password': return 'Mật khẩu là bắt buộc';
        default: return 'Trường này là bắt buộc';
      }
    }

    if (field.errors['email']) {
      return 'Email không hợp lệ';
    }

    return '';
  }

  /**
   * Hiển thị thông báo đăng nhập thành công
   */
  private showLoginSuccess(): void {
    this.notification.success(
      'Đăng nhập thành công! 🎉',
      'Chào mừng bạn trở lại Word Quest',
      {
        nzDuration: 3000,
        nzStyle: {
          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
        },
        nzClass: 'custom-notification success-notification'
      }
    );
  }

  /**
   * Xử lý và hiển thị lỗi từ API
   */
  private handleApiError(error: any): void {
    let title = 'Có lỗi xảy ra';
    let content = '';

    if (error?.error?.message) {
      const errorMessage = error.error.message.toLowerCase();
      
      if (errorMessage.includes('user') && errorMessage.includes('not found')) {
        title = 'Tài khoản không tồn tại';
        content = 'Email hoặc mật khẩu không chính xác.';
      } else if (errorMessage.includes('password') && errorMessage.includes('incorrect')) {
        title = 'Mật khẩu không chính xác';
        content = 'Vui lòng thử lại hoặc đặt lại mật khẩu.';
      } else if (errorMessage.includes('invalid credentials') || errorMessage.includes('unauthorized')) {
        title = 'Thông tin đăng nhập sai';
        content = 'Email hoặc mật khẩu không chính xác.';
      } else {
        title = 'Lỗi';
        content = error.error.message;
      }
    } else if (error?.status === 0) {
      title = 'Lỗi kết nối';
      content = 'Không thể kết nối đến máy chủ.';
    } else if (error?.status === 401) {
      title = 'Thông tin không đúng';
      content = 'Email hoặc mật khẩu không chính xác.';
    } else {
      title = 'Có lỗi xảy ra';
      content = 'Vui lòng thử lại sau.';
    }

    this.notification.error(title, content, {
      nzDuration: 4000,
      nzStyle: {
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)',
        color: 'white'
      },
      nzClass: 'custom-notification error-notification'
    });
  }
}