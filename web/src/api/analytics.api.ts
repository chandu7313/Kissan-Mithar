import { apiClient } from './client.js';
import { AnalyticsSummary } from '../types/index.js';

export class AnalyticsApi {
  static async getSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get('/analytics/summary');
    return response.data?.data;
  }
}
