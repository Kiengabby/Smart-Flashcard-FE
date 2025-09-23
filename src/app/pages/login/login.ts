import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzMessageModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private message: NzMessageService
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
      password: ['', [Validators.required]]
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
        this.isLoading = false;
        this.message.success('Đăng nhập thành công!');
        
        // Điều hướng đến dashboard sau khi đăng nhập thành công
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
        console.error('Login error:', error);
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
    this.showPassword = !this.showPassword;
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
      return fieldName === 'email' ? 'Email là bắt buộc' : 'Mật khẩu là bắt buộc';
    }

    if (field.errors['email']) {
      return 'Email không hợp lệ';
    }

    return '';
  }
}