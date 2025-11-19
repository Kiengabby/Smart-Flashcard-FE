import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../../services/auth.service';

// Custom Validator cho password matching
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

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
   * Khởi tạo reactive form với validation và custom validator
   */
  private initializeForm(): void {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator // Custom validator cho toàn bộ form
    });
  }

  /**
   * Xử lý submit form đăng ký
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;

    // Gọi API đăng ký
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          // Kiểm tra nếu đang dùng mock mode
          if (response.message && response.message.includes('Mock Mode')) {
            this.notification.warning(
              'Demo Mode',
              'Đăng ký thành công (Demo Mode - Backend chưa chạy)',
              {
                nzDuration: 4000
              }
            );
          } else {
            this.showRegisterSuccess();
          }
          
          // Điều hướng đến dashboard sau khi đăng ký thành công
          this.router.navigate(['/app/dashboard']);
        });
      },
      error: (error) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          // Xử lý lỗi với notification service
          this.handleApiError(error);
          
          console.error('Register error:', error);
          
          // Reset form validation để có thể submit lại
          this.registerForm.markAsUntouched();
        });
      }
    });
  }

  /**
   * Đánh dấu tất cả fields đã được touched để hiển thị lỗi
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Toggle hiển thị/ẩn mật khẩu
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle hiển thị/ẩn xác nhận mật khẩu
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Đăng ký bằng Google
   * TODO: Tích hợp Firebase Google Auth
   */
  registerWithGoogle(): void {
    if (this.isLoading) return;
    
    // TODO: Implement Google authentication
    // this.authService.registerWithGoogle()
  }

  /**
   * Đăng ký bằng Facebook
   * TODO: Tích hợp Firebase Facebook Auth
   */
  registerWithFacebook(): void {
    if (this.isLoading) return;
    
    // TODO: Implement Facebook authentication
    // this.authService.registerWithFacebook()
  }

  /**
   * Điều hướng đến trang đăng nhập
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Kiểm tra field có lỗi và đã được touched không
   */
  hasFieldError(fieldName: string, errorType?: string): boolean {
    const field = this.registerForm.get(fieldName);
    
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
    const field = this.registerForm.get(fieldName);
    
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      switch (fieldName) {
        case 'displayName': return 'Họ và tên là bắt buộc';
        case 'email': return 'Email là bắt buộc';
        case 'password': return 'Mật khẩu là bắt buộc';
        case 'confirmPassword': return 'Xác nhận mật khẩu là bắt buộc';
        default: return 'Trường này là bắt buộc';
      }
    }

    if (field.errors['email']) {
      return 'Email không hợp lệ';
    }

    if (field.errors['minlength']) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    return '';
  }

  /**
   * Kiểm tra xem có lỗi password mismatch không
   */
  get hasPasswordMismatchError(): boolean {
    return this.registerForm.errors?.['passwordMismatch'] && 
           this.registerForm.get('confirmPassword')?.touched || false;
  }

  /**
   * Hiển thị thông báo đăng ký thành công
   */
  private showRegisterSuccess(): void {
    this.notification.success(
      'Tạo tài khoản thành công! 🚀',
      'Chào mừng bạn đến với Word Quest!',
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
      
      if (errorMessage.includes('email') && (errorMessage.includes('exist') || errorMessage.includes('already'))) {
        title = 'Email đã được sử dụng';
        content = 'Email này đã được đăng ký. Vui lòng dùng email khác.';
      } else if (errorMessage.includes('validation')) {
        title = 'Thông tin không hợp lệ';
        content = 'Vui lòng kiểm tra lại thông tin.';
      } else {
        title = 'Lỗi';
        content = error.error.message;
      }
    } else if (error?.status === 0) {
      title = 'Lỗi kết nối';
      content = 'Không thể kết nối đến máy chủ.';
    } else if (error?.status >= 500) {
      title = 'Lỗi máy chủ';
      content = 'Máy chủ gặp sự cố. Thử lại sau.';
    } else {
      title = 'Có lỗi xảy ra';
      content = 'Email đã tồn tại vui lòng sử dụng email khác.';
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