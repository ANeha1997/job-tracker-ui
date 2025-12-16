// src/app/pages/interviews/interviews.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FormsModule } from '@angular/forms';

import {
  JobApplicationService,
  JobApplication
} from '../../services/job-application';

import {
  InterviewService,
  Interview,
  InterviewCreateRequest
} from '../../services/interview';


import { SignalRService, InterviewNotification } from '../../services/signalr';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.scss']
})
export class InterviewsComponent implements OnInit {
  applications: JobApplication[] = [];
  interviews: Interview[] = [];

  selectedApplicationId: number | null = null;

  isLoadingApps = false;
  isLoadingInterviews = false;
  isSubmitting = false;
  errorMessage = '';

  form!: FormGroup;
  editingId: number | null = null;

  // for showing banner 
  lastInterview: InterviewNotification | null = null;

  
  readonly types = [
    { value: 'Phone Screen', label: 'Phone Screen' },
    { value: 'Online', label: 'Online' },
    { value: 'Technical', label: 'Technical' },
    { value: 'HR', label: 'HR' },
    { value: 'Onsite', label: 'Onsite' },
    { value: 'Other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private appService: JobApplicationService,
    private interviewService: InterviewService,

    
    private signalR: SignalRService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      scheduledAt: ['', Validators.required],
      type: ['Phone Screen', Validators.required],
      locationOrLink: [''],
      notes: [''],
      result: ['']
    });
  }

  ngOnInit(): void {
    // START SIGNALR + LISTEN
    if (this.auth.isLoggedIn()) {
      this.signalR.start();
      this.signalR.interviewCreated$.subscribe(n => {
        if (n) {
          this.lastInterview = n;

          
          this.loadInterviews();
        }
      });
    }

    // Conditional validation for Location/Link
    const typeControl = this.form.get('type');
    const locControl = this.form.get('locationOrLink');

    typeControl?.valueChanges.subscribe((value: string) => {
      if (value === 'Phone Screen' || value === 'Online') {
        locControl?.setValidators([Validators.required]);
      } else {
        locControl?.clearValidators();
      }
      locControl?.updateValueAndValidity();
    });

    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoadingApps = true;
    this.appService.getApplications().subscribe({
      next: apps => {
        this.applications = apps || [];
        this.isLoadingApps = false;

        // auto-select first application if none selected
        if (!this.selectedApplicationId && this.applications.length > 0) {
          this.selectedApplicationId = this.applications[0].id;
          this.loadInterviews(this.selectedApplicationId);
        }
      },
      error: () => {
        this.isLoadingApps = false;
        this.errorMessage = 'Failed to load applications.';
      }
    });
  }

  
  loadInterviews(appId?: number): void {
    const id = appId ?? this.selectedApplicationId;
    if (!id) {
      this.interviews = [];
      return;
    }

    this.isLoadingInterviews = true;
    this.interviewService.getForApplication(id).subscribe({
      next: data => {
        this.interviews = data || [];
        this.isLoadingInterviews = false;
      },
      error: () => {
        this.isLoadingInterviews = false;
        this.errorMessage = 'Failed to load interviews.';
      }
    });
  }

  onApplicationChange(appId: number | null): void {
    this.selectedApplicationId = appId;
    this.resetForm();
    if (appId) {
      this.loadInterviews(appId);
    } else {
      this.interviews = [];
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      scheduledAt: '',
      type: 'Phone Screen',
      locationOrLink: '',
      notes: '',
      result: ''
    });
  }

  submit(): void {
    if (!this.selectedApplicationId) {
      this.errorMessage = 'Please select an application first.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.form.value;

    const iso = raw.scheduledAt
      ? new Date(raw.scheduledAt).toISOString()
      : new Date().toISOString();

    const req: InterviewCreateRequest = {
      jobApplicationId: this.selectedApplicationId,
      scheduledAt: iso,
      type: raw.type ?? '',
      locationOrLink: raw.locationOrLink || '',
      notes: raw.notes || '',
      result: raw.result || ''
    };

    if (this.editingId) {
      // UPDATE
      this.interviewService.updateInterview(this.editingId, req).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loadInterviews();
          this.resetForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update interview.';
        }
      });
    } else {
      // CREATE
      this.interviewService.createInterview(req).subscribe({
        next: created => {
          this.isSubmitting = false;
          this.interviews.unshift(created);
          this.resetForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to add interview.';
        }
      });
    }
  }

  edit(i: Interview): void {
    this.editingId = i.id;

    // convert ISO to yyyy-MM-ddTHH:mm for datetime-local
    const dtLocal = i.scheduledAt
      ? i.scheduledAt.substring(0, 16)
      : '';

    this.form.patchValue({
      scheduledAt: dtLocal,
      type: i.type || 'Phone Screen',
      locationOrLink: i.locationOrLink,
      notes: i.notes,
      result: i.result
    });
  }

  delete(i: Interview): void {
    if (!confirm('Delete this interview?')) return;

    this.interviewService.deleteInterview(i.id).subscribe({
      next: () => {
        this.interviews = this.interviews.filter(x => x.id !== i.id);
      },
      error: () => {
        this.errorMessage = 'Failed to delete interview.';
      }
    });
  }
}
