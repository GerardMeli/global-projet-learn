import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorHandlerService } from '../../../core/services/users/error-handler.service';
import { ProfileService } from '../../../core/services/users/profile.service';


@Component({
  selector: 'app-email-change-confirm',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: `./email-change-confirm.component.html`,
  styleUrls: [`./email-change-confirm.component.scss`]
})
export class EmailChangeConfirmComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) { 
      this.state = 'error'; 
      this.errorMessage = 'No verification token provided.'; 
      return; 
    }

    this.profileService.confirmEmailChange(token).subscribe({
      next: () => { 
        this.state = 'success'; 
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.errorMessage = handled.userMessage;
        this.state = 'error';
      }
    });
  }
}