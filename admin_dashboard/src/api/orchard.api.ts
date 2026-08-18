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

  static async updateDetails(id: string, details: any): Promise<any> {
    const res = await apiClient.patch(`/orchard-requests/${id}/details`, details);
    return res.data?.data;
  }

  static async submitReport(requestId: string, reportData: Partial<OrchardReport>): Promise<any> {
    const res = await apiClient.post(`/orchard-requests/${requestId}/report`, reportData);
    return res.data?.data;
  }

  static async uploadReportPdf(fileBlob: Blob, filename: string): Promise<string> {
    const signRes = await apiClient.post('/uploads/sign', { folder: 'kissan_mithar_reports' });
    const { signature, timestamp, cloudName, apiKey } = signRes.data.data;
    
    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', 'kissan_mithar_reports');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload PDF to Cloudinary');
    }

    const data = await uploadRes.json();
    return data.secure_url;
  }
}
