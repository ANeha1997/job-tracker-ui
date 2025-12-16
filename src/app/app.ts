import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  get isAdmin(): boolean {
    return this.auth.isAdmin;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
