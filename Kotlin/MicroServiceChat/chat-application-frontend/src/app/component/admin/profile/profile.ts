// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { Language, Theme } from '../../../core/models/users/enums.model';
import { UserProfileResponse, UserProfileUpdateRequest, UserPreferencesUpdateRequest, PasswordChangeRequest, EmailUpdateRequest } from '../../../core/models/users/profile.model';
import { AuthService } from '../../../core/services/users/auth.service';
import { ProfileService } from '../../../core/services/users/profile.service';
import { TokenService } from '../../../core/services/users/token.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: './user-list.html',
  styles: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  profile: UserProfileResponse | null = null;
  loading = true;
  error = '';
  successMessage = '';
  saving = false;
  
  activeTab: 'personal' | 'preferences' | 'security' | 'email' = 'personal';
  
  // Form data
  personalInfo: Partial<UserProfileUpdateRequest> = {};
  preferences: UserPreferencesUpdateRequest = {
    language: Language.EN,
    theme: Theme.SYSTEM,
    emailNotifications: true
  };
  passwordData: PasswordChangeRequest & { confirmPassword: string } = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  emailData: EmailUpdateRequest = {
    newEmail: '',
    password: ''
  };

  constructor(
    private profileService: ProfileService,
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.resetPersonalInfo();
        this.resetPreferences();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load profile';
        this.loading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  getFullName(): string {
    if (!this.profile) return '';
    const parts = [this.profile.firstName, this.profile.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  }

  getInitials(): string {
    if (!this.profile) return 'U';
    const first = this.profile.firstName ? this.profile.firstName.charAt(0) : '';
    const last = this.profile.lastName ? this.profile.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  resetPersonalInfo(): void {
    if (!this.profile) return;
    this.personalInfo = {
      firstName: this.profile.firstName || '',
      lastName: this.profile.lastName || '',
      phoneNumber: this.profile.phoneNumber || '',
      address: this.profile.address || ''
    };
  }

  resetPreferences(): void {
    if (!this.profile) return;
    this.preferences = {
      language: this.profile.language,
      theme: this.profile.theme,
      emailNotifications: true
    };
  }

  resetPasswordForm(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  updatePersonalInfo(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.profile) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    this.profileService.updateUserProfile(userId, this.personalInfo).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.successMessage = 'Informations mises à jour avec succès';
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Échec de la mise à jour';
        this.saving = false;
        console.error('Error updating profile:', error);
      }
    });
  }

  updatePreferences(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.profile) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    this.profileService.updateUserPreferences(userId, this.preferences).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.successMessage = 'Préférences mises à jour avec succès';
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Échec de la mise à jour des préférences';
        this.saving = false;
        console.error('Error updating preferences:', error);
      }
    });
  }

  isPasswordValid(): boolean {
    const pwd = this.passwordData;
    return pwd.newPassword.length >= 8 &&
           /[A-Z]/.test(pwd.newPassword) &&
           /[a-z]/.test(pwd.newPassword) &&
           /[0-9]/.test(pwd.newPassword) &&
           pwd.newPassword === pwd.confirmPassword;
  }

  changePassword(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.isPasswordValid()) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    const passwordRequest: PasswordChangeRequest = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword,
      confirmPassword: this.passwordData.confirmPassword
    };

    this.profileService.changePassword(userId, passwordRequest).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe modifié avec succès';
        this.resetPasswordForm();
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Échec du changement de mot de passe';
        this.saving = false;
        console.error('Error changing password:', error);
      }
    });
  }

  requestEmailChange(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.emailData.newEmail || !this.emailData.password) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    this.profileService.requestEmailChange(userId, this.emailData).subscribe({
      next: () => {
        this.successMessage = 'Demande de changement d\'email envoyée. Vérifiez votre nouvelle boîte aux lettres.';
        this.emailData = { newEmail: '', password: '' };
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.error = 'Échec de la demande de changement d\'email';
        this.saving = false;
        console.error('Error requesting email change:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}