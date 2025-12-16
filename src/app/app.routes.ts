import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ApplicationsComponent } from './pages/applications/applications';
import { CompaniesComponent } from './pages/companies/companies';
import { InterviewsComponent } from './pages/interviews/interviews';
import { JobsComponent } from './pages/jobs/jobs';

import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // protected routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'applications', component: ApplicationsComponent, canActivate: [authGuard] },
  { path: 'companies', component: CompaniesComponent, canActivate: [authGuard] },
  { path: 'jobs', component: JobsComponent, canActivate: [authGuard] },
  { path: 'interviews', component: InterviewsComponent, canActivate: [authGuard] },
   { path: '**', redirectTo: 'login' },
];
