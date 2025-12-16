import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  form: FormGroup;
  error: string | null = null;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.error = null;

    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);

        //  backend message if available
        const backendMsg =
          err?.error?.message ||        // { message: "Invalid credentials." }
          err?.error ||                 // plain string
          err?.message;

        this.error = backendMsg || 'Login failed. Please check your email or password.';
      }
    });
  }
}
