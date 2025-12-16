// src/app/services/company.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Company {
  id: number;
  name: string;
  industry?: string | null;
  location?: string | null;
}

export interface CompanyCreateRequest {
  name: string;
  location?: string | null;
  industry?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl; 

  //  Public list of all companies (for logged-in users)
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/Companies`);
  }

  //  Create a new company (admin / power user)
  createCompany(req: CompanyCreateRequest): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/Companies`, req);
  }
}
