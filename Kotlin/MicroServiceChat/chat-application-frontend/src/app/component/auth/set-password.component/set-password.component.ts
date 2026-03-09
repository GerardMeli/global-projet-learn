// set-password.component.ts
// Route  : /auth/set-password?token=<jwt>
// Flux   : admin crée le compte → email invitation → user clique le lien
//          → saisit son mot de passe → backend réinitialise + envoie welcome
//          → redirection vers /home

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule }            from '@angular/material/card';
import { MatFormFieldModule }        from '@angular/material/form-field';
import { MatInputModule }            from '@angular/material/input';
import { MatButtonModule }           from '@angular/material/button';
import { MatIconModule }             from '@angular/material/icon';
import { MatProgressSpinnerModule }  from '@angular/material/progress-spinner';
import { MatDividerModule }          from '@angular/material/divider';

import { STRONG_PASSWORD_PATTERN }  from '../../../core/models/users/email pwd.model';
import { AuthService }              from '../../../core/services/users/auth.service';
import { ErrorHandlerService }      from '../../../core/services/users/error-handler.service';

function passwordsMatch(control: AbstractControl) {
  const newPwd  = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPwd === confirm ? null : { mismatch: true };
}

@Component({
  selector:    'app-set-password',
  standalone:  true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './set-password.component.html',
  styleUrls:   ['./set-password.component.scss'],
})
export class SetPasswordComponent implements OnInit {

  form:               FormGroup;
  loading             = false;
  success             = false;
  tokenError          = false;
  errorMessage        = '';
  hideNewPassword     = true;
  hideConfirmPassword = true;
  private token       = '';

  constructor(
    private fb:           FormBuilder,
    private authService:  AuthService,
    private errorHandler: ErrorHandlerService,
    private route:        ActivatedRoute,
    private router:       Router,
  ) {
    this.form = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(STRONG_PASSWORD_PATTERN),
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatch });
  }

  get f() { return this.form.controls; }

  // ── Password requirement flags ────────────────────────────────────────────
  get hasMinLength():   boolean { return (this.f['newPassword'].value?.length ?? 0) >= 8; }
  get hasUpperCase():   boolean { return /[A-Z]/.test(this.f['newPassword'].value ?? ''); }
  get hasLowerCase():   boolean { return /[a-z]/.test(this.f['newPassword'].value ?? ''); }
  get hasNumber():      boolean { return /[0-9]/.test(this.f['newPassword'].value ?? ''); }
  get hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.f['newPassword'].value ?? '');
  }

  getPasswordStrength(): number {
    const pwd = this.f['newPassword'].value || '';
    let s = 0;
    if (pwd.length >= 8)          s += 25;
    if (/[A-Z]/.test(pwd))        s += 25;
    if (/[a-z]/.test(pwd))        s += 25;
    if (/[0-9]/.test(pwd))        s += 12.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) s += 12.5;
    return Math.min(s, 100);
  }

  getPasswordStrengthText(): string {
    const s = this.getPasswordStrength();
    if (s < 40) return 'Weak';
    if (s < 70) return 'Medium';
    return 'Strong';
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) this.tokenError = true;
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading      = true;
    this.errorMessage = '';

    // Réutilise POST /api/auth/reset-password — même endpoint, même payload
    this.authService.resetPassword({
      token:           this.token,
      newPassword:     this.f['newPassword'].value,
      confirmPassword: this.f['confirmPassword'].value,
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        // Redirige vers /home après 2,5 s (le welcome email a déjà été envoyé côté backend)
        setTimeout(() => this.router.navigate(['/home']), 2500);
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        if (this.errorHandler.isTokenError(handled)) {
          this.tokenError = true;
        } else {
          this.errorMessage = handled.userMessage;
        }
        this.loading = false;
      },
    });
  }
}