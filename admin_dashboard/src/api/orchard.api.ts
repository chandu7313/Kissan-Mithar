import { apiClient } from './client.js';
import { OrchardReport, OrchardRequest, OrchardStatus } from '../types/index.js';

export class OrchardApi {
  static async getRequests(): Promise<OrchardRequest[]> {
    try {
      const res = await apiClient.get('/orchard-requests');
      return res.data?.data || [];
    } catch {
      // Return sample demo data if backend is offline
      return this.getMockRequests();
    }
  }

  static async getRequestById(id: string): Promise<OrchardRequest> {
    try {
      const res = await apiClient.get(`/orchard-requests/${id}`);
      return res.data?.data;
    } catch {
      return this.getMockRequests().find((r) => r.id === id) || this.getMockRequests()[0];
    }
  }

  static async updateStatus(id: string, status: OrchardStatus): Promise<void> {
    try {
      await apiClient.patch(`/orchard-requests/${id}/status`, { status });
    } catch {
      console.log(`Mock status updated for ${id} to ${status}`);
    }
  }

  static async submitReport(requestId: string, reportData: Partial<OrchardReport>): Promise<any> {
    try {
      const res = await apiClient.post(`/orchard-requests/${requestId}/report`, reportData);
      return res.data?.data;
    } catch {
      return { id: `REP-${Date.now()}`, ...reportData };
    }
  }

  static getMockRequests(): OrchardRequest[] {
    return [
      {
        id: 'REQ-8921',
        farmerId: 'FARMER-9821',
        expertId: 'EXPERT-001',
        status: 'UNDER_REVIEW',
        farmer: {
          id: 'FARMER-9821',
          name: 'Ramesh Patel',
          phoneNumber: '+91 98765 43210',
          village: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
          landAcres: 2.5,
          primaryCrop: 'Mango & Guava',
        },
        photos: {
          front: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
          left: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
          right: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
          center: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800',
        },
        gps: {
          latitude: 18.5204,
          longitude: 73.8567,
          accuracy: 4.8,
          village: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
        },
        landDetails: {
          size: '2.5 Acres',
          soilType: 'Red Loamy Soil (Lal Mitti)',
          waterSources: ['Borewell (2.5 Inch)', 'Canal Water Connection'],
          electricity: true,
          drip: true,
          existingCrops: ['Old Mango Trees (5 Nos)'],
        },
        notes: 'Farmer wants an ultra high-density mango and guava intercrop plantation to start generating commercial income within 24 months.',
        voiceNoteUrl: 'https://actions.google.com/sounds/v1/nature/wind_through_trees.ogg',
        submittedAt: '2026-08-06T09:30:00Z',
        updatedAt: '2026-08-07T14:20:00Z',
      },
      {
        id: 'REQ-4412',
        farmerId: 'FARMER-4412',
        expertId: 'EXPERT-002',
        status: 'SUBMITTED',
        farmer: {
          id: 'FARMER-4412',
          name: 'Suresh Kumar',
          phoneNumber: '+91 98450 12345',
          village: 'Nandyal',
          district: 'Kurnool',
          state: 'Andhra Pradesh',
          landAcres: 5.0,
          primaryCrop: 'Sweet Lime & Pomegranate',
        },
        photos: {
          front: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=800',
          left: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        },
        gps: {
          latitude: 15.4785,
          longitude: 78.4832,
          village: 'Nandyal',
          district: 'Kurnool',
          state: 'Andhra Pradesh',
        },
        landDetails: {
          size: '5.0 Acres',
          soilType: 'Black Cotton Soil',
          waterSources: ['Farm Pond', 'Borewell'],
          electricity: true,
          drip: false,
          existingCrops: ['Cotton'],
        },
        notes: 'Shifting from seasonal cotton to long-term pomegranate & sweet lime orchard.',
        submittedAt: '2026-08-07T11:15:00Z',
        updatedAt: '2026-08-07T11:15:00Z',
      },
      {
        id: 'REQ-3390',
        farmerId: 'FARMER-3390',
        expertId: 'EXPERT-001',
        status: 'PLAN_READY',
        farmer: {
          id: 'FARMER-3390',
          name: 'Venkat Rao',
          phoneNumber: '+91 94401 55667',
          village: 'Siddipet',
          district: 'Medak',
          state: 'Telangana',
          landAcres: 3.0,
          primaryCrop: 'Custard Apple (Sitaphal)',
        },
        photos: {
          front: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
        },
        gps: {
          latitude: 18.1018,
          longitude: 78.8522,
          village: 'Siddipet',
          district: 'Medak',
          state: 'Telangana',
        },
        landDetails: {
          size: '3.0 Acres',
          soilType: 'Gravelly Red Soil',
          waterSources: ['Borewell'],
          electricity: true,
          drip: true,
          existingCrops: ['None (Barren Land)'],
        },
        notes: 'Dryland horticulture plan required for Balanagar Custard Apple.',
        submittedAt: '2026-08-04T08:00:00Z',
        updatedAt: '2026-08-06T17:00:00Z',
        report: {
          id: 'REP-3390',
          orchardRequestId: 'REQ-3390',
          summary: 'High-density Balanagar & NMK-1 Golden Custard Apple plantation plan.',
          recommendedVarieties: [
            { crop: 'Custard Apple', variety: 'Balanagar & NMK-1 Golden', yieldPerAcre: '5-7 Tons', plantingSeason: 'July - August' },
          ],
          plantationLayout: { rowSpacingMeters: 4.0, plantSpacingMeters: 4.0, totalPlantsEstimate: 750 },
          soilTreatment: 'Apply 10kg FYM + 200g Neem cake per pit.',
          fertilizerSchedule: '100g N, 50g P, 100g K per plant/year.',
          waterRequirement: '15L / plant / day in peak summer.',
          dripLayout: '2 drippers of 4 LPH per plant.',
          estimatedBudget: 60000,
          projectedRoi: 'Break-even in Year 3. Annual return Rs. 2.2 Lakhs.',
          implementationTimeline: 'Pit preparation in June, plantation in July.',
          pestControl: 'Mealybug control using neem oil and chlorpyrifos banding.',
          governmentSchemes: 'Telangana Rythu Bandhu & MIDH drip subsidy.',
          maintenanceCalendar: 'Annual pruning in January.',
          generatedAt: '2026-08-06T17:00:00Z',
        },
      },
    ];
  }
}
