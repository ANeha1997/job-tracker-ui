import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { SignalRService, InterviewNotification } from '../../services/signalr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  signalR = inject(SignalRService);

  lastInterview: InterviewNotification | null = null;

  ngOnInit(): void {
    
    if (this.auth.isLoggedIn()) {
      this.signalR.start();

      this.signalR.interviewCreated$.subscribe(n => {
        if (n) this.lastInterview = n;
      });
    }
  }
}
