import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface JobApplication {
  id: number;
  jobId?: number | null;
  companyId?: number | null;
  title: string;
  location?: string | null;
  status: number;
  appliedDate: string;
  sourceUrl?: string | null;
  notes?: string | null;
  companyName?: string | null;
}

export interface JobApplicationCreateRequest {
  jobId: number | null;
  companyId?: number | null;
  title?: string;
  location?: string;
  status: number;
  appliedDate?: string | null;
  sourceUrl?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class JobApplicationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/JobApplications`;

  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.baseUrl);
  }

  createApplication(req: JobApplicationCreateRequest): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.baseUrl, req);
  }

  updateApplication(id: number, req: JobApplicationCreateRequest) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, req);
  }

  deleteApplication(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
