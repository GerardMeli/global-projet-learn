// migration.model.ts
// Correspond exactement aux DTOs Kotlin du backend

export interface AgriUserDto {
  userCode:        string;
  userFirstName?:  string;
  userLastName?:   string;
  userEmail?:      string;
  userPhoneNumber?: string;
  isActive?:       boolean;
  userType?:       string;
  state?:          string;
  address?:        AgriAddressDto;
  roles?:          AgriRoleDto[];
}

export interface AgriAddressDto {
  addressCountry?: string;
  addressCity?:    string;
  region?:         string;
}

export interface AgriRoleDto {
  roleCode?:  string;
  roleName?:  string;
}

/** Réponse de POST /api/admin/migration/run */
export interface MigrationReport {
  total:   number;
  created: number;
  skipped: number;
  errors:  number;
  details: string[];
}

/** Réponse de POST /api/admin/migration/single */
export interface SingleMigrationResponse {
  resultat: 'CREE' | 'IGNORE';
  userCode: string;
  message:  string;
}