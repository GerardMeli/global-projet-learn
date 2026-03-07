import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
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


@Component({
  selector: 'app-resend-verification',
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
  templateUrl: './resend-verification.component.html',
  styleUrls: ['./resend-verification.component.scss']
})
export class ResendVerificationComponent implements OnInit {
  form: FormGroup;
  loading = false;
  sent = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({ 
      email: ['', [Validators.required, Validators.email]] 
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (email) this.form.patchValue({ email });
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';

    this.authService.resendVerification(this.f['email'].value).subscribe({
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