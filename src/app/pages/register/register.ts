import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  templateUrl: './register.html',
  styleUrl: './register.scss'
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
    private message: NzMessageService
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
        this.isLoading = false;
        this.message.success('Đăng ký thành công!');
        
        // Điều hướng đến dashboard sau khi đăng ký thành công
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error(error.error?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
        console.error('Register error:', error);
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
    
    console.log('Đăng ký bằng Google');
    // TODO: Implement Google authentication
    // this.authService.registerWithGoogle()
  }

  /**
   * Đăng ký bằng Facebook
   * TODO: Tích hợp Firebase Facebook Auth
   */
  registerWithFacebook(): void {
    if (this.isLoading) return;
    
    console.log('Đăng ký bằng Facebook');
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
}