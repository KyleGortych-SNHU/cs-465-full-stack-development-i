import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authentication } from '../services/authentication';
import { User } from '../models/user';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  public formError: string = '';
  public isSubmitting = false;
  credentials = { name: '', email: '', password: '' };

  constructor(
    private router: Router,
    private authentication: Authentication
  ) {}

  public onLoginSubmit(): void {
    this.formError = '';
    if (!this.credentials.email || !this.credentials.password) {
      this.formError = 'Email and password are required, please try again';
      return;
    }
    this.doLogin();
  }

  private doLogin(): void {
    const newUser = {
      name: this.credentials.name,
      email: this.credentials.email,
    } as User;

    this.formError = '';
    this.isSubmitting = true;

    this.authentication.login(newUser, this.credentials.password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.formError =
          err?.error?.message ||
          'Login failed. Please check your credentials and try again.';
      },
    });
  }
}
