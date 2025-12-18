// src/app/services/interview.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Match what your backend returns
export interface Interview {
  id: number;
  jobApplicationId: number;
  scheduledAt: string;      
  type: string;
  locationOrLink: string | null;
  notes: string | null;
  result: string | null;
}

// Body used for create/update
export interface InterviewCreateRequest {
  jobApplicationId: number;
  scheduledAt: string;      
  type: string;
  locationOrLink?: string;
  notes?: string;
  result?: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private baseUrl = environment.apiBaseUrl; // same pattern as your other services

  constructor(private http: HttpClient) {}

  // GET /api/interviews/by-application/{id}
  getForApplication(appId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(
      `${this.baseUrl}/interviews/by-application/${appId}`
    );
  }

  // POST /api/interviews
  createInterview(req: InterviewCreateRequest): Observable<Interview> {
    return this.http.post<Interview>(`${this.baseUrl}/interviews`, req);
  }

  // PUT /api/interviews/{id}
  updateInterview(id: number, req: InterviewCreateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/interviews/${id}`, req);
  }

  // DELETE /api/interviews/{id}
  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/interviews/${id}`);
  }
}
