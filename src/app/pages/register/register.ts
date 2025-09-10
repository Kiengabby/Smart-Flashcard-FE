import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
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
    private authService: AuthService
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
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.register({
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Đánh dấu tất cả fields đã được touched để hiển thị lỗi
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  registerWithGoogle(): void {
    if (this.isLoading) return;
    // Có thể bổ sung sau nếu muốn đăng ký bằng Google
  }

  registerWithFacebook(): void {
    if (this.isLoading) return;
    // Có thể bổ sung sau nếu muốn đăng ký bằng Facebook
  }

  navigateToLogin(): void { this.router.navigate(['/auth/login']); }

  hasFieldError(fieldName: string, errorType?: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (!field) return false;
    if (errorType) return field.hasError(errorType) && field.touched;
    return field.invalid && field.touched;
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      switch (fieldName) {
        case 'displayName': return 'Họ và tên là bắt buộc';
        case 'email': return 'Email là bắt buộc';
        case 'password': return 'Mật khẩu là bắt buộc';
        case 'confirmPassword': return 'Xác nhận mật khẩu là bắt buộc';
      }
    }

    if (field.errors['email']) return 'Email không hợp lệ';
    if (field.errors['minlength']) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return '';
  }

  get hasPasswordMismatchError(): boolean {
    return !!(this.registerForm.errors?.['passwordMismatch'] && this.registerForm.get('confirmPassword')?.touched);
  }
}