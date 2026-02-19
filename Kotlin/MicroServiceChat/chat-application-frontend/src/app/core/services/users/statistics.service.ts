import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { UserStatisticsResponse, UserActivityResponse } from '../../models/users/statistics.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatisticsService {

  private readonly baseUrl = `${environment.apiUrl}/admin/statistics`;

  constructor(private http: HttpClient) {}

  getUserStatistics(): Observable<UserStatisticsResponse> {
    // Get token directly
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('🔍 StatisticsService.getUserStatistics()');
    console.log('URL:', `${this.baseUrl}/summary`); // NO trailing slash
    console.log('Token present:', !!token);

    // IMPORTANT: NO trailing slash for statistics endpoints
    return this.http.get<UserStatisticsResponse>(`${this.baseUrl}/summary`, { headers });
  }

  getUserActivity(): Observable<UserActivityResponse[]> {
    // Get token directly
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('🔍 StatisticsService.getUserActivity()');
    console.log('URL:', `${this.baseUrl}/activity`); // NO trailing slash
    console.log('Token present:', !!token);

    // IMPORTANT: NO trailing slash for statistics endpoints
    return this.http.get<UserActivityResponse[]>(`${this.baseUrl}/activity`, { headers });
  }

  // Test method removed - not needed anymore
}