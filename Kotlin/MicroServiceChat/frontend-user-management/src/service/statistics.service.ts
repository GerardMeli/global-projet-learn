import type { UserStatisticsResponse, UserActivityResponse } from '../type/statistics.types';
import api from './api'; 

class StatisticsService {
  async getUserStatistics(): Promise<UserStatisticsResponse> {
    const response = await api.get<UserStatisticsResponse>('/statistics/users');
    return response.data;
  }

  async getUserActivity(userId: number): Promise<UserActivityResponse> {
    const response = await api.get<UserActivityResponse>(`/statistics/users/${userId}/activity`);
    return response.data;
  }
}

export default new StatisticsService();