// src/app/pages/jobs/jobs.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { JobService, Job, JobSearchResult } from '../../services/job';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.scss']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  isLoading = false;
  errorMessage = '';

  // simple paging
  page = 1;
  pageSize = 200;
  totalCount = 0;

  // search filters
  search = '';
  location = '';
  minSalary?: number;
  maxSalary?: number;

  constructor(
    private jobsService: JobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobsService
      .getJobs(this.page, this.pageSize, {
        search: this.search || undefined,
        location: this.location || undefined,
        minSalary: this.minSalary,
        maxSalary: this.maxSalary
      })
      .subscribe({
        next: (result: JobSearchResult) => {
          this.jobs = result.items;
          this.totalCount = result.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load job postings.';
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadJobs();
  }

  clearFilters(): void {
    this.search = '';
    this.location = '';
    this.minSalary = undefined;
    this.maxSalary = undefined;
    this.page = 1;
    this.loadJobs();
  }

  // "Add Application" feature
  addApplication(job: Job): void {
    this.router.navigate(['/applications'], {
      queryParams: { jobId: job.id }
    });
  }
}
