import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authentication } from '../services/authentication';
import { User } from '../models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  public formError = '';
  public isSubmitting = false;

  credentials = { name: '', email: '', password: '', adminKey: '' };

  constructor(
    private router: Router,
    private authentication: Authentication
  ) {}

  public onRegisterSubmit(): void {
    this.formError = '';
    if (
      !this.credentials.name ||
      !this.credentials.email ||
      !this.credentials.password
    ) {
      this.formError = 'Name, email and password are required.';
      return;
    }

    const newUser = {
      name: this.credentials.name,
      email: this.credentials.email,
    } as User;

    this.isSubmitting = true;

    this.authentication
      .register(
        newUser,
        this.credentials.password,
        this.credentials.adminKey || undefined
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['']);
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.formError =
            err?.error?.message ||
            'Registration failed. Please try again.';
        },
      });
  }
}
