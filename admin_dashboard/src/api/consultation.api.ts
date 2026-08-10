import { apiClient } from './client.js';
import { ConsultationItem } from '../types/index.js';

export class ConsultationApi {
  static async getConsultations(): Promise<ConsultationItem[]> {
    const res = await apiClient.get('/consultations');
    return res.data?.data || [];
  }

  static async getById(id: string): Promise<ConsultationItem> {
    const res = await apiClient.get(`/consultations/${id}`);
    return res.data?.data;
  }

  static async updateConsultation(id: string, data: {
    status?: string;
    prescription?: any;
    followUpDate?: string;
    notes?: string;
  }): Promise<ConsultationItem> {
    const res = await apiClient.patch(`/consultations/${id}`, data);
    return res.data?.data;
  }
}
