import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      });
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }

  async loginWithGoogle(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      await this.authService.loginWithGoogle();
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithFacebook(): Promise<void> {
    if (this.isLoading) return;
    // TODO: Implement Facebook login
    console.log('Facebook login not implemented yet');
  }

  forgotPassword(): void {
    // TODO: Implement forgot password
    console.log('Forgot password not implemented yet');
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}