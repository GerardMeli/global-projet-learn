// migration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';
import { MigrationReport, AgriUserDto, SingleMigrationResponse } from '../../models/users/migration.model';

@Injectable({ providedIn: 'root' })
export class MigrationService {

  private readonly baseUrl = `${environment.apiUrl}/admin/migration`;

  constructor(
    private readonly http:         HttpClient,
    private readonly tokenService: TokenService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${this.tokenService.getAccessToken()}`,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // POST /api/admin/migration/run
  // Lance la migration en masse de tous les users Agriculture → Chat
  // ─────────────────────────────────────────────────────────────────
  runMassiveMigration(): Observable<MigrationReport> {
    return this.http.post<MigrationReport>(
      `${this.baseUrl}/run`,
      {},
      { headers: this.headers() }
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // POST /api/admin/migration/single
  // Migre un seul user Agriculture → Chat
  // ─────────────────────────────────────────────────────────────────
  runSingleMigration(agriUser: AgriUserDto): Observable<SingleMigrationResponse> {
    return this.http.post<SingleMigrationResponse>(
      `${this.baseUrl}/single`,
      agriUser,
      { headers: this.headers() }
    );
  }
}