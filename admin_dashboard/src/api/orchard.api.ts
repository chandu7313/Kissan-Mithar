import { apiClient } from './client.js';
import { OrchardReport, OrchardRequest, OrchardStatus } from '../types/index.js';

export class OrchardApi {
  static async getRequests(): Promise<OrchardRequest[]> {
    const res = await apiClient.get('/orchard-requests');
    return res.data?.data || [];
  }

  static async getRequestById(id: string): Promise<OrchardRequest> {
    const res = await apiClient.get(`/orchard-requests/${id}`);
    return res.data?.data;
  }

  static async updateStatus(id: string, status: OrchardStatus): Promise<void> {
    await apiClient.patch(`/orchard-requests/${id}/status`, { status });
  }

  static async submitReport(requestId: string, reportData: Partial<OrchardReport>): Promise<any> {
    const res = await apiClient.post(`/orchard-requests/${requestId}/report`, reportData);
    return res.data?.data;
  }
}
