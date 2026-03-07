import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider'; 
import { AuthService } from '../../../core/services/users/auth.service';
import { ErrorHandlerService } from '../../../core/services/users/error-handler.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: `./forgot-password.component.html`,
  styleUrls: [`./forgot-password.component.scss`]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent = false;
  email = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {
    this.form = this.fb.group({ 
      email: ['', [Validators.required, Validators.email]] 
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.email = this.f['email'].value;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => { 
        this.sent = true; 
        this.loading = false; 
      },
      error: () => {
        this.sent = true; 
        this.loading = false;
      }
    });
  }
}