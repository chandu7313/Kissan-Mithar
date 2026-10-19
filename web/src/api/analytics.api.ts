import { apiClient } from './client.js';
import { AnalyticsSummary } from '../types/index.js';

export interface ExecutiveSummary {
  timeRange: '7d' | '30d' | '90d' | 'all';
  periodLabel: string;
  farmers: {
    total: number;
    newInPeriod: number;
    totalDevices: number;
    activeDevices30d: number;
  };
  services: {
    totalActive: number;
    totalCompleted: number;
    orchards: { total: number; byStatus: Record<string, number> };
    fertilizers: { total: number; byStatus: Record<string, number> };
    diseases: { total: number; byStatus: Record<string, number> };
    labour: { total: number; byStatus: Record<string, number> };
    consultations: { total: number; byStatus: Record<string, number> };
  };
  bazaar: {
    totalListings: number;
    activeListings: number;
    totalProcurementRequests: number;
    activeProcurementRequests: number;
    totalMatches: number;
  };
  staff: {
    totalAdmins: number;
    totalExperts: number;
  };
  recentEvents: Array<{
    id: string;
    service: string;
    serviceName: string;
    farmerName: string;
    village: string;
    status: string;
    timestamp: string;
  }>;
}

export class AnalyticsApi {
  static async getSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get('/analytics/summary');
    return response.data?.data;
  }

  static async getExecutiveSummary(timeRange: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<ExecutiveSummary> {
    const response = await apiClient.get(`/analytics/executive-summary?timeRange=${timeRange}`);
    return response.data?.data;
  }
}
