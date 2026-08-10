import { apiClient } from './client.js';

export interface Expert {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  specialization: string;
  experienceYears: number;
  rating?: number;
  isAvailable?: boolean;
  createdAt?: string;
}

export class ExpertApi {
  /**
   * Fetch a list of all experts
   */
  static async listExperts(): Promise<Expert[]> {
    const response = await apiClient.get('/experts');
    return response.data?.data || [];
  }

  /**
   * Create a new expert
   */
  static async createExpert(data: Partial<Expert> & { password?: string }): Promise<Expert> {
    const response = await apiClient.post('/experts', data);
    return response.data?.data;
  }
}
