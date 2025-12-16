import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CompanyService, Company, CompanyCreateRequest } from '../../services/company';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './companies.html',
  styleUrls: ['./companies.scss']
})
export class CompaniesComponent implements OnInit {

  companies: Company[] = [];
  filteredCompanies: Company[] = [];

  form!: FormGroup;

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  search: string = '';

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      location: [''],
      industry: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.companyService.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        this.filteredCompanies = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load companies.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.search.toLowerCase().trim();
    this.filteredCompanies = this.companies.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.location && c.location.toLowerCase().includes(term))
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const req: CompanyCreateRequest = {
      name: this.form.value.name,
      location: this.form.value.location,
      industry: this.form.value.industry
    };

    this.companyService.createCompany(req).subscribe({
      next: (created) => {
        this.isSubmitting = false;

        // Add to list
        this.companies.unshift(created);
        this.applyFilter();

        this.form.reset({
          name: '',
          location: '',
          industry: ''
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create company.';
      }
    });
  }
}

