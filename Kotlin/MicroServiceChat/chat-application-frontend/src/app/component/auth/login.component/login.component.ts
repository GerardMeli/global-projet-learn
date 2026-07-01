import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthErrorCode } from '../../../core/models/users/error.model';
import { AuthService } from '../../../core/services/users/auth.service';
import { ErrorHandlerService } from '../../../core/services/users/error-handler.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: [`./login.component.scss`]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  errorCode: AuthErrorCode | null = null;
  hidePassword = true;
  AuthErrorCode = AuthErrorCode;

  private returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/chat';
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.form.patchValue({ email: params['email'] });
      }
    });
  }

  get f() { return this.form.controls; }

  get isAccountStateError(): boolean {
    return [
      AuthErrorCode.ACCOUNT_NOT_VERIFIED,
      AuthErrorCode.ACCOUNT_BLOCKED,
      AuthErrorCode.ACCOUNT_SUSPENDED,
      AuthErrorCode.ACCOUNT_DELETED,
      AuthErrorCode.ACCOUNT_INACTIVE
    ].includes(this.errorCode as AuthErrorCode);
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }

    this.loading = true;
    this.errorMessage = '';
    this.errorCode = null;

    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Welcome back! Redirecting...', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          const role = response.data?.user?.role;
          this.router.navigateByUrl(role === 'ADMIN' ? '/admin' : this.returnUrl);
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.errorCode = handled.code;
        this.errorMessage = handled.userMessage;
        this.loading = false;
      }
    });
  }

  goToResend(): void {
    const email = this.f['email'].value;
    if (email) {
      this.router.navigate(['/auth/resend-verification'], {
        queryParams: { email }
      });
    } else {
      this.router.navigate(['/auth/resend-verification']);
    }
  }
}