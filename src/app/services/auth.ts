import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponseDto {
  token: string;
  expiresAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
 // confirmPassword: string; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // ---------- SAFE localStorage helpers ----------
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  }

  private saveToken(token: string) {
    const storage = this.getStorage();
    if (storage) storage.setItem('token', token);
  }

  private removeToken() {
    const storage = this.getStorage();
    if (storage) storage.removeItem('token');
  }

  private readToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem('token') : null;
  }
  // ------------------------------------------------

  login(dto: LoginDto) {
    return this.http
      .post<AuthResponseDto>(`${this.baseUrl}/Auth/login`, dto)
      .pipe(
        tap((res) => {
          if (res.token) this.saveToken(res.token);
        })
      );
  }

  register(dto: RegisterDto) {
    return this.http
      .post<AuthResponseDto>(`${this.baseUrl}/Auth/register`, dto)
      .pipe(
        tap((res) => {
          if (res.token) this.saveToken(res.token);
        })
      );
  }

  logout() {
    this.removeToken();
  }

  get token(): string | null {
    return this.readToken();
  }

  isLoggedIn(): boolean {
    return !!this.readToken();
  }

  // -------- Username from JWT payload --------
  get userName(): string | null {
    const token = this.token;
    if (!token) return null;

    try {
      const payloadJson = atob(token.split('.')[1]);
      const payload = JSON.parse(payloadJson);

      // Prefer explicit username claim if present
      const fromClaim =
        payload['userName'] ||      // custom claim added in AuthController
        payload['name'] ||          // ClaimTypes.Name (sometimes shows as 'name')
        payload['given_name'] ||    // other possible names
        null;

      if (fromClaim) {
        return fromClaim;
      }

      // Fallback: derive from email
      const email: string | undefined =
        payload['email'] || payload['unique_name'];

      if (email) {
        const atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
      }

      return payload['sub'] ?? null;
    } catch {
      return null;
    }
  }

  // -------- Roles from JWT payload --------
  get roles(): string[] {
    const token = this.token;
    if (!token) return [];

    try {
      const payloadJson = atob(token.split('.')[1]);
      const payload = JSON.parse(payloadJson);
      const claim = payload['role']; // ASP.NET stores ClaimTypes.Role as 'role'

      if (!claim) return [];
      return Array.isArray(claim) ? claim : [claim];
    } catch {
      return [];
    }
  }

  get isAdmin(): boolean {
    return this.roles.includes('Admin');
  }
}
