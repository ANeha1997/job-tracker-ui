import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  form: FormGroup;
  error: string | null = null;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.error = null;

    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        alert('Account created. You can now log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);

        // show backend message 
        this.error =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Registration failed. Please try again.';
      }
    });
  }
}
