import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Language } from '../../../core/models/users/enums.model';
import { AuthService } from '../../../core/services/users/auth.service';
import { ErrorHandlerService } from '../../../core/services/users/error-handler.service';
 

// Validateur de téléphone amélioré
export function cameroonPhoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const cleanValue = control.value.replace(/\s/g, '');
  const phoneRegex = /^(?:(?:\+|00)237|0)?[6][0-9]{8}$/;
  
  return phoneRegex.test(cleanValue) ? null : { invalidCameroonPhone: true };
}

@Component({
  selector: 'app-register',
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
  templateUrl: `./register.component.html`,
  styleUrls: [`./register.component.scss`]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  registered = false;
  registeredEmail = '';
  errorMessage = '';
  hidePassword = true;
  
  languages = [
    { code: Language.FR, name: 'Français', flag: '🇫🇷' },
    { code: Language.EN, name: 'English', flag: '🇬🇧' },
    { code: Language.ES, name: 'Español', flag: '🇪🇸' },
    { code: Language.DE, name: 'Deutsch', flag: '🇩🇪' },
    { code: Language.IT, name: 'Italiano', flag: '🇮🇹' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      phoneNumber: ['', cameroonPhoneValidator],
      language: [Language.FR]
    });
  }

  get f() { return this.form.controls; }

  // Phone validation helpers
  get phoneHasValidPrefix(): boolean {
    const value = this.f['phoneNumber'].value?.replace(/\s/g, '');
    return value ? value.startsWith('6') : false;
  }

  get phoneHasValidLength(): boolean {
    const value = this.f['phoneNumber'].value?.replace(/\s/g, '');
    return value ? /^[6][0-9]{8}$/.test(value) : false;
  }

  // Phone input formatting
  onPhoneInput(event: any) {
    let input = event.target.value.replace(/\D/g, '').slice(0, 9);
    
    // Format as XXX XXX XXX
    if (input.length > 6) {
      input = input.slice(0, 3) + ' ' + input.slice(3, 6) + ' ' + input.slice(6);
    } else if (input.length > 3) {
      input = input.slice(0, 3) + ' ' + input.slice(3);
    }
    
    this.f['phoneNumber'].setValue(input, { emitEvent: false });
  }

  // Password strength
  getPasswordStrength(): number {
    const pwd = this.f['password'].value || '';
    let strength = 0;
    
    if (pwd.length >= 6) strength += 20;
    if (pwd.length >= 8) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';

    // Clean phone number before sending
    const formValue = { ...this.form.value };
    if (formValue.phoneNumber) {
      // Add +237 prefix for API
      const cleanPhone = formValue.phoneNumber.replace(/\s/g, '');
      formValue.phoneNumber = '+237' + cleanPhone;
    }

    this.authService.register(formValue).subscribe({
      next: (response) => {
        this.registeredEmail = response.email;
        this.registered = true;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.errorMessage = handled.userMessage;
        this.loading = false;
      }
    });
  }

  goToResend(): void {
    this.router.navigate(['/auth/resend-verification'], {
      queryParams: { email: this.registeredEmail }
    });
  }
}