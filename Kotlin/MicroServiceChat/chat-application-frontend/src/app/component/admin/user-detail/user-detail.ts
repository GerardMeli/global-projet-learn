// user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileResponse } from '../../../core/models/users/profile.model';
import { 
  AdminUserUpdateRequest, 
  UserStatusUpdateRequest, 
  UserRoleUpdateRequest, 
  AdminUserResponse 
} from '../../../core/models/users/admin.model';
import { UserStatus, UserRole, Language, Theme } from '../../../core/models/users/enums.model';
import { AdminService } from '../../../core/services/users/admin.service';
import { TokenService } from '../../../core/services/users/token.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetailComponent implements OnInit {
  userId!: number;
  user: UserProfileResponse | null = null;
  loading = true;
  error = '';
  successMessage = '';
  saving = false;
  updating = false;

  editData: Partial<AdminUserUpdateRequest> = {};
  statusUpdate: UserStatusUpdateRequest = { status: UserStatus.ACTIVE };
  roleUpdate: UserRoleUpdateRequest = { role: UserRole.USER };
  
  emailNotifications = true;

  // Options pour les selects
  languageOptions = [
    { value: Language.EN, label: 'English' },
    { value: Language.FR, label: 'Français' },
    { value: Language.ES, label: 'Español' },
    { value: Language.DE, label: 'Deutsch' },
    { value: Language.IT, label: 'Italiano' }
  ];

  themeOptions = [
    { value: Theme.LIGHT, label: 'Clair' },
    { value: Theme.DARK, label: 'Sombre' },
    { value: Theme.SYSTEM, label: 'Système' }
  ];

  statusOptions = [
    { value: UserStatus.ACTIVE, label: 'Actif', color: 'success' },
    { value: UserStatus.PENDING, label: 'En attente', color: 'warning' },
    { value: UserStatus.SUSPENDED, label: 'Suspendu', color: 'warning' },
    { value: UserStatus.BLOCKED, label: 'Bloqué', color: 'danger' },
    { value: UserStatus.DELETED, label: 'Supprimé', color: 'danger' }
  ];

  roleOptions = [
    { value: UserRole.USER, label: 'Utilisateur', color: 'info' },
    { value: UserRole.ADMIN, label: 'Administrateur', color: 'danger' },
    { value: UserRole.SUPPORT, label: 'Support', color: 'warning' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.error = '';
    
    if (!this.tokenService.isAdmin()) {
      this.error = 'Accès non autorisé. Vous devez être administrateur.';
      this.loading = false;
      return;
    }
    
    this.adminService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.resetForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.handleError(error, 'chargement de l\'utilisateur');
        this.loading = false;
      }
    });
  }

  private handleError(error: any, context: string): void {
    if (error.status === 401) {
      this.error = 'Votre session a expiré. Veuillez vous reconnecter.';
      setTimeout(() => {
        // Rediriger vers login
        this.router.navigate(['/auth/login']);
      }, 2000);
    } else if (error.status === 403) {
      this.error = 'Vous n\'avez pas les permissions nécessaires.';
    } else if (error.status === 404) {
      this.error = `Utilisateur avec l'ID ${this.userId} non trouvé.`;
    } else if (error.status === 0) {
      this.error = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else {
      this.error = `Erreur lors du ${context}. Veuillez réessayer.`;
    }
  }

  getFullName(): string {
    if (!this.user) return '';
    const parts = [this.user.firstName, this.user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Utilisateur';
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const first = this.user.firstName ? this.user.firstName.charAt(0) : '';
    const last = this.user.lastName ? this.user.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  getAvatarColor(): string {
    if (!this.user) return '#667eea';
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return colors[this.user.id % colors.length];
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'ACTIVE': '#22c55e',
      'PENDING': '#eab308',
      'SUSPENDED': '#f97316',
      'BLOCKED': '#ef4444',
      'DELETED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'ADMIN': '#ef4444',
      'USER': '#22c55e',
      'SUPPORT': '#eab308'
    };
    return colors[role] || '#6b7280';
  }

  resetForm(): void {
    if (!this.user) return;
    
    this.editData = {
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      phoneNumber: this.user.phoneNumber || '',
      address: this.user.address || '',
      language: this.user.language,
      theme: this.user.theme,
      isActive: this.user.isActive,
      emailVerified: this.user.emailVerified
    };
    
    this.emailNotifications = true;
    this.statusUpdate = { status: this.user.status };
    this.roleUpdate = { role: this.user.role };
  }

  hasChanges(): boolean {
    if (!this.user) return false;
    
    return JSON.stringify(this.editData) !== JSON.stringify({
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      phoneNumber: this.user.phoneNumber || '',
      address: this.user.address || '',
      language: this.user.language,
      theme: this.user.theme,
      isActive: this.user.isActive,
      emailVerified: this.user.emailVerified
    });
  }

  saveChanges(): void {
    if (!this.user || !this.hasChanges()) return;
    
    this.saving = true;
    this.error = '';
    this.successMessage = '';
    
    const updateData = {
      ...this.editData,
      emailNotifications: this.emailNotifications
    };
    
    this.adminService.updateUser(this.user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Utilisateur mis à jour avec succès';
        this.loadUser();
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.error = 'Échec de la mise à jour';
        this.saving = false;
      }
    });
  }

  updateStatus(): void {
    if (!this.user) return;
    
    this.updating = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.updateUserStatus(this.user.id, this.statusUpdate).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Statut mis à jour avec succès';
        this.loadUser();
        this.statusUpdate.reason = '';
        this.updating = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.error = 'Échec de la mise à jour du statut';
        this.updating = false;
      }
    });
  }

  updateRole(): void {
    if (!this.user) return;
    
    this.updating = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.updateUserRole(this.user.id, this.roleUpdate).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Rôle mis à jour avec succès';
        this.loadUser();
        this.roleUpdate.reason = '';
        this.updating = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.error = 'Échec de la mise à jour du rôle';
        this.updating = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}