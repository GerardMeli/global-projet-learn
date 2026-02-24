// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/users/admin.service';
import { UserProfileResponse } from '../../../core/models/users/profile.model';
import { TokenService } from '../../../core/services/users/token.service';
import { UserStatus, UserRole } from '../../../core/models/users/enums.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: UserProfileResponse[] = [];
  filteredUsers: UserProfileResponse[] = [];
  paginatedUsers: UserProfileResponse[] = [];
  
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  activeFilter = '';
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  showDeleteModal = false;
  userToDelete: UserProfileResponse | null = null;
  deleteInProgress = false;

  loading = false;
  error = '';
  successMessage = '';

  // Options pour les filtres
  roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: UserRole.ADMIN, label: 'Administrateur' },
    { value: UserRole.USER, label: 'Utilisateur' },
    { value: UserRole.SUPPORT, label: 'Support' }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: UserStatus.ACTIVE, label: 'Actif' },
    { value: UserStatus.PENDING, label: 'En attente' },
    { value: UserStatus.SUSPENDED, label: 'Suspendu' },
    { value: UserStatus.BLOCKED, label: 'Bloqué' },
    { value: UserStatus.DELETED, label: 'Supprimé' }
  ];

  activeOptions = [
    { value: '', label: 'Toute activité' },
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' }
  ];

  Math = Math;

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    if (!this.tokenService.isAdmin()) {
      this.error = 'Accès non autorisé. Vous devez être administrateur.';
      this.loading = false;
      return;
    }
    
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.applyFilters();
        this.loading = false;
        
        if (this.users.length > 0) {
          this.successMessage = `${this.users.length} utilisateur(s) chargé(s) avec succès`;
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.handleError(error, 'chargement des utilisateurs');
        this.loading = false;
      }
    });
  }

  private handleError(error: any, context: string): void {
    if (error.status === 401) {
      this.error = 'Votre session a expiré. Veuillez vous reconnecter.';
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
    } else if (error.status === 403) {
      this.error = 'Vous n\'avez pas les permissions nécessaires.';
    } else if (error.status === 0) {
      this.error = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else {
      this.error = `Erreur lors du ${context}. Veuillez réessayer.`;
    }
  }

  getFullName(user: UserProfileResponse): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Utilisateur';
  }

  getInitials(firstName: string | null, lastName: string | null): string {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  getAvatarColor(userId: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return colors[userId % colors.length];
  }

  getStatusColor(status: string): { bg: string; color: string } {
    const colors: Record<string, { bg: string; color: string }> = {
      'ACTIVE': { bg: '#22c55e20', color: '#22c55e' },
      'PENDING': { bg: '#eab30820', color: '#eab308' },
      'SUSPENDED': { bg: '#f9731620', color: '#f97316' },
      'BLOCKED': { bg: '#ef444420', color: '#ef4444' },
      'DELETED': { bg: '#6b728020', color: '#6b7280' }
    };
    return colors[status] || { bg: '#6b728020', color: '#6b7280' };
  }

  getRoleColor(role: string): { bg: string; color: string } {
    const colors: Record<string, { bg: string; color: string }> = {
      'ADMIN': { bg: '#ef444420', color: '#ef4444' },
      'USER': { bg: '#22c55e20', color: '#22c55e' },
      'SUPPORT': { bg: '#eab30820', color: '#eab308' }
    };
    return colors[role] || { bg: '#6b728020', color: '#6b7280' };
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'PENDING': 'En attente',
      'SUSPENDED': 'Suspendu',
      'BLOCKED': 'Bloqué',
      'DELETED': 'Supprimé'
    };
    return labels[status] || status;
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'USER': 'Utilisateur',
      'SUPPORT': 'Support'
    };
    return labels[role] || role;
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filtre de recherche
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const fullName = this.getFullName(user).toLowerCase();
        const email = user.email.toLowerCase();
        const idMatch = user.id.toString().includes(this.searchTerm);
        
        if (!fullName.includes(searchLower) && !email.includes(searchLower) && !idMatch) {
          return false;
        }
      }
      
      // Filtre par rôle
      if (this.roleFilter && user.role !== this.roleFilter) {
        return false;
      }
      
      // Filtre par statut
      if (this.statusFilter && user.status !== this.statusFilter) {
        return false;
      }
      
      // Filtre par activité
      if (this.activeFilter) {
        const isActive = this.activeFilter === 'true';
        if (user.isActive !== isActive) {
          return false;
        }
      }
      
      return true;
    });
    
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  changePageSize(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  getRoleCount(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  getActiveCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getStatusCount(status: string): number {
    return this.users.filter(u => u.status === status).length;
  }

  deleteUser(user: UserProfileResponse): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    
    this.deleteInProgress = true;
    
    this.adminService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur supprimé avec succès';
        this.loadUsers();
        this.closeDeleteModal();
        this.deleteInProgress = false;
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.error = 'Échec de la suppression';
        this.closeDeleteModal();
        this.deleteInProgress = false;
        
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
}