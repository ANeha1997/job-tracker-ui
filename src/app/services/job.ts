// src/app/services/job.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Job {
  id: number;
  title: string;
  location?: string | null;
  employmentType?: string | null;
  seniorityLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  postedDate: string;

  companyName?: string | null;

 
  company?: {
    id: number;
    name: string;
    location?: string | null;
    industry?: string | null;
  };

  sourceId?: string | null;
}

export interface JobSearchResult {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Job[];
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getJobs(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      search?: string;
      location?: string;
      minSalary?: number;
      maxSalary?: number;
    }
  ): Observable<JobSearchResult> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.location) {
      params = params.set('location', filters.location);
    }
    if (filters?.minSalary != null) {
      params = params.set('minSalary', filters.minSalary);
    }
    if (filters?.maxSalary != null) {
      params = params.set('maxSalary', filters.maxSalary);
    }

    return this.http.get<JobSearchResult>(`${this.baseUrl}/jobs`, {
      params
    });
  }

  getJob(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.baseUrl}/jobs/${id}`);
  }
}
