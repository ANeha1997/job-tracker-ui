import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth';

// export interface InterviewNotification {
//   id: number;
//   jobApplicationId: number;
//   scheduledAt: string;
//   type?: string;
//   locationOrLink?: string;
//   notes?: string;
//   result?: string;
// }
export interface InterviewNotification {
  interviewId: number;
  scheduledAt: string;
  jobApplicationId: number;
  jobTitle: string;
  companyName: string;
}
@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: signalR.HubConnection;

  private _interviewCreated = new BehaviorSubject<InterviewNotification | null>(null);
  interviewCreated$ = this._interviewCreated.asObservable();

  private auth = inject(AuthService);

  start() {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiRoot}/hubs/notifications`, {
        accessTokenFactory: () => this.auth.token || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('InterviewCreated', (data: InterviewNotification) => {
      console.log('SignalR InterviewCreated:', data);
      this._interviewCreated.next(data);
    });

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error', err));
  }

  stop() {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }
}
