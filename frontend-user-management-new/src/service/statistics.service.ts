import type { UserStatisticsResponse, PageableResponse, UserActivityResponse } from '../type/statistics.types';
import api from './api'; 

class StatisticsService {
  async getUserStatistics(): Promise<UserStatisticsResponse> {
    const response = await api.get<UserStatisticsResponse>('/admin/statistics/summary');
    return response.data;
  }

  async getUserActivity(
    page: number = 0,
    size: number = 20,
    sort: string = 'id,desc'
  ): Promise<PageableResponse<UserActivityResponse>> {
    const response = await api.get<PageableResponse<UserActivityResponse>>('/admin/statistics/activity', {
      params: { page, size, sort }
    });
    return response.data;
  }
}

export default new StatisticsService();