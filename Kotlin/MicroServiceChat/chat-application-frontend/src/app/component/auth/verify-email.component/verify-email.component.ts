import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/users/auth.service';
import { ErrorHandlerService } from '../../../core/services/users/error-handler.service';


@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'expired' | 'invalid' | 'no-token' = 'loading';
  progress = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    // Simulate progress for better UX
    const interval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 10;
      }
    }, 200);

    const token = this.route.snapshot.queryParams['token'];
    if (!token) { 
      this.state = 'no-token'; 
      clearInterval(interval);
      return; 
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => { 
        this.progress = 100;
        setTimeout(() => {
          this.state = 'success'; 
        }, 500);
        clearInterval(interval);
      },
      error: (err: HttpErrorResponse) => {
        clearInterval(interval);
        const handled = this.errorHandler.handle(err);
        this.state = this.errorHandler.isTokenError(handled)
          ? (handled.code === 'EXPIRED_TOKEN' ? 'expired' : 'invalid')
          : 'invalid';
      }
    });
  }
}