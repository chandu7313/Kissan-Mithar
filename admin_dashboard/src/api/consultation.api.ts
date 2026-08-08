import { apiClient } from './client.js';
import { ConsultationItem } from '../types/index.js';

export class ConsultationApi {
  static async getConsultations(): Promise<ConsultationItem[]> {
    try {
      const res = await apiClient.get('/consultations');
      return res.data?.data || [];
    } catch {
      return this.getMockConsultations();
    }
  }

  static getMockConsultations(): ConsultationItem[] {
    return [
      {
        id: 'CNS-8921',
        farmerId: 'FARMER-9821',
        expertId: 'EXPERT-001',
        mode: 'VOICE',
        category: 'Soil & Leaf Health',
        scheduledAt: '2026-08-08T14:30:00Z',
        language: 'Hindi',
        status: 'SCHEDULED',
        notes: 'Lower guava leaves displaying yellow chlorosis between veins. Seeking fungicide/micronutrient recommendation.',
        mediaUrls: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800'],
        farmer: {
          id: 'FARMER-9821',
          name: 'Ramesh Patel',
          phoneNumber: '+91 98765 43210',
          village: 'Khed, Pune',
        },
        expert: {
          id: 'EXPERT-001',
          name: 'Dr. Sunil Rao',
          phoneNumber: '+91 98111 22233',
          specialization: 'Horticulture & Plant Pathology',
          experienceYears: 14,
          rating: 4.9,
        },
      },
      {
        id: 'CNS-5510',
        farmerId: 'FARMER-4412',
        expertId: 'EXPERT-002',
        mode: 'VIDEO',
        category: 'Pest & Insect Attack',
        scheduledAt: '2026-08-09T10:00:00Z',
        language: 'Telugu',
        status: 'SCHEDULED',
        notes: 'Fruit borer caterpillars detected in pomegranate fruitlets.',
        mediaUrls: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800'],
        farmer: {
          id: 'FARMER-4412',
          name: 'Suresh Kumar',
          phoneNumber: '+91 98450 12345',
          village: 'Nandyal, Kurnool',
        },
        expert: {
          id: 'EXPERT-002',
          name: 'Dr. Ananya Sharma',
          phoneNumber: '+91 98222 33344',
          specialization: 'Soil Chemistry & Micro-Irrigation',
          experienceYears: 9,
          rating: 4.8,
        },
      },
    ];
  }
}
