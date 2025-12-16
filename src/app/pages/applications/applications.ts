// src/app/pages/applications/applications.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  JobApplicationService,
  JobApplication,
  JobApplicationCreateRequest
} from '../../services/job-application';
import { JobService, Job } from '../../services/job';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './applications.html',
  styleUrls: ['./applications.scss']
})
export class ApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  jobs: Job[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  form!: FormGroup;
  editingId: number | null = null;

  
  private pendingJobId: number | null = null;

 
  selectedCompanyName: string | null = null;

 
  readonly statuses = [
    { value: 0, label: 'Applied' },
    { value: 1, label: 'Phone Screen' },
    { value: 2, label: 'Interview' },
    { value: 3, label: 'Offer' },
    { value: 4, label: 'Rejected' },
    { value: 5, label: 'Withdrawn' }
  ];

  constructor(
    private fb: FormBuilder,
    private appService: JobApplicationService,
    private jobService: JobService,
    private route: ActivatedRoute
  ) {
    // Stronger validation for “Complex Data Entry”
    this.form = this.fb.group({
      jobId: [null, Validators.required],
      // title is still read-only, but required (must come from a job)
      title: [{ value: '', disabled: true }, Validators.required],
      location: [{ value: '', disabled: true }],
      status: [0, Validators.required],
      appliedDate: ['', Validators.required],
      sourceUrl: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // read ?jobId= and ?company= from URL
    this.route.queryParamMap.subscribe(params => {
      // from Job Postings "Add Application"
      const jobIdParam = params.get('jobId');
      const id = jobIdParam ? Number(jobIdParam) : null;
      this.pendingJobId = Number.isFinite(id as any) ? id : null;

      // from Companies "view jobs for this company"
      const companyParam = params.get('company');
      this.selectedCompanyName =
        companyParam && companyParam.trim() !== '' ? companyParam.trim() : null;

      // if jobs already loaded, apply pending job
      if (this.pendingJobId && this.jobs.length > 0) {
        this.selectJobFromId(this.pendingJobId);
      }
    });

    this.loadJobs();
    this.loadApplications();
  }

  loadJobs(): void {
    this.jobService.getJobs(1, 500).subscribe({
      next: (result) => {
        this.jobs = result.items;

        // if user came from Job Postings with a given jobId
        if (this.pendingJobId) {
          this.selectJobFromId(this.pendingJobId);
        }
      },
      error: () => {
        console.error('Failed to load jobs');
      }
    });
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.appService.getApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load applications.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Jobs shown in the dropdown:
   * - If a company was selected in Companies page -> only that company's jobs
   * - If no jobs match that company -> fall back to all jobs
   * - If no company filter -> all jobs
   */
  get availableJobs(): Job[] {
    if (!this.selectedCompanyName) {
      return this.jobs;
    }

    const name = this.selectedCompanyName.toLowerCase();
    const filtered = this.jobs.filter(j =>
      (j.companyName || '').toLowerCase() === name
    );

    return filtered.length > 0 ? filtered : this.jobs;
  }

  // helper used both by query-param flow and dropdown change
  private selectJobFromId(jobId: number | null): void {
    if (!jobId) {
      this.form.patchValue({
        jobId: null,
        title: '',
        location: ''
      });
      return;
    }

    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    this.form.patchValue({
      jobId: job.id,
      title: job.title,
      location: job.location || ''
    });
  }

  // event-based version
  onJobChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const jobId = select ? Number(select.value) : null;

    this.pendingJobId = jobId;
    this.selectJobFromId(jobId);
  }

  resetForm(): void {
    this.editingId = null;
    this.pendingJobId = null;
    // keep selectedCompanyName so the filter stays when user is on Applications page
    this.form.reset({
      jobId: null,
      title: '',
      location: '',
      status: 0,
      appliedDate: '',
      sourceUrl: '',
      notes: ''
    });
  }

  // current selected Job object (for extra details)
  get selectedJob(): Job | undefined {
    if (!this.form) return undefined;
    const jobId = this.form.get('jobId')?.value;
    if (!jobId) return undefined;
    return this.jobs.find(j => j.id === Number(jobId));
  }

  // CREATE / UPDATE application
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue(); // includes disabled fields

    const req: JobApplicationCreateRequest = {
      jobId: raw.jobId ? Number(raw.jobId) : null,
      status: Number(raw.status),
      appliedDate: raw.appliedDate ? raw.appliedDate : null,
      sourceUrl: raw.sourceUrl || '',
      notes: raw.notes || ''
    };

    if (this.editingId) {
      // UPDATE existing application
      this.appService.updateApplication(this.editingId, req).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loadApplications();
          this.resetForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update application.';
        }
      });
    } else {
      // CREATE new application
      this.appService.createApplication(req).subscribe({
        next: (created: JobApplication) => {
          this.isSubmitting = false;
          this.applications.unshift(created);
          this.resetForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create application.';
        }
      });
    }
  }

  edit(app: JobApplication): void {
    this.editingId = app.id;
    this.pendingJobId = app.jobId ?? null;

    this.form.patchValue({
      jobId: app.jobId ?? null,
      title: app.title,
      location: app.location,
      status: app.status,
      appliedDate: app.appliedDate ? app.appliedDate.substring(0, 10) : '',
      sourceUrl: app.sourceUrl,
      notes: app.notes
    });
  }

  delete(app: JobApplication): void {
    if (!confirm(`Delete application "${app.title}"?`)) return;

    this.appService.deleteApplication(app.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== app.id);
      },
      error: () => {
        this.errorMessage = 'Failed to delete application.';
      }
    });
  }

  statusLabel(status: number): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : `Status ${status}`;
  }
}
