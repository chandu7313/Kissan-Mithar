import { apiClient } from './client.js';

// --- Fertilizer Types ---
export interface FertilizerRequestItem {
  id: string;
  farmerId: string;
  expertId: string | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'EXPERT_ASSIGNED' | 'PLAN_READY' | 'COMPLETED' | 'CANCELLED';
  cropType: string | null;
  cropAge: string | null;
  landAcres: number | null;
  soilType: string | null;
  problemCategory: string | null;
  issueDescription: string | null;
  voiceNoteUrl: string | null;
  voiceText: string | null;
  photos: string[] | any;
  gps: any;
  previousFertilizers: string | null;
  irrigationType: string | null;
  notes: string | null;
  submittedAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    name: string;
    phoneNumber: string;
    village: string | null;
    district: string | null;
  };
  expert?: {
    id: string;
    name: string;
    specialization: string;
  } | null;
  plan?: {
    id: string;
    diagnosis: string;
    summary: string;
    schedule: any[];
    organicAlternatives: string | null;
    soilTreatment: string | null;
    precautions?: string | null;
    estimatedBudget: number | null;
    pdfUrl: string | null;
    createdAt: string;
  } | null;
}

export interface FertilizerScheduleStage {
  stage: string;
  timing: string;
  fertilizers: Array<{
    name: string;
    dosage: string;
    method: string;
  }>;
  notes?: string;
}

export interface FertilizerPlanPayload {
  diagnosis: string;
  summary: string;
  schedule: FertilizerScheduleStage[];
  organicAlternatives?: string;
  soilTreatment?: string;
  precautions?: string;
  estimatedBudget?: number;
  pdfUrl?: string;
}

// --- Disease Types ---
export interface DiseaseRequestItem {
  id: string;
  farmerId: string;
  expertId: string | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'EXPERT_ASSIGNED' | 'DIAGNOSED' | 'COMPLETED' | 'CANCELLED';
  cropType: string | null;
  cropAge: string | null;
  affectedPart: string | null;
  symptomDescription: string | null;
  voiceNoteUrl: string | null;
  voiceText: string | null;
  photos: string[] | any;
  gps: any;
  spreadRate: string | null;
  previousPesticides: string | null;
  notes: string | null;
  submittedAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    name: string;
    phoneNumber: string;
    village: string | null;
    district: string | null;
  };
  expert?: {
    id: string;
    name: string;
    specialization: string;
  } | null;
  treatment?: {
    id: string;
    diseaseName: string;
    causalOrganism: string | null;
    severity: string;
    diagnosisSummary: string;
    immediateAction: string;
    chemicalTreatment: any[];
    organicTreatment: string | null;
    preventativeMeasures: string | null;
    followUpDays: number | null;
    estimatedCost: number | null;
    pdfUrl: string | null;
    createdAt: string;
  } | null;
}

export interface ChemicalTreatmentItem {
  chemicalName: string;
  commercialBrand: string;
  dosage: string;
  applicationMethod: string;
  waitingPeriodDays?: number;
}

export interface DiseaseTreatmentPayload {
  diseaseName: string;
  causalOrganism?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnosisSummary: string;
  immediateAction: string;
  chemicalTreatment: ChemicalTreatmentItem[];
  organicTreatment?: string;
  preventativeMeasures?: string;
  followUpDays?: number;
  estimatedCost?: number;
  pdfUrl?: string;
}

// --- Labour Types ---
export interface LabourRequestItem {
  id: string;
  farmerId: string;
  expertId: string | null;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'LABOURERS_ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  taskType: string;
  taskDescription: string | null;
  cropType: string | null;
  landAcres: number | null;
  labourersRequired: number;
  preferredStartDate: string | null;
  preferredEndDate: string | null;
  durationDays: number | null;
  dailyWage: number | null;
  totalBudget: number | null;
  mealsProvided: boolean;
  transportProvided: boolean;
  gps: any;
  voiceNoteUrl: string | null;
  voiceText: string | null;
  photos: any;
  specialRequirements: string | null;
  urgency: string;
  submittedAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    name: string;
    phoneNumber: string;
    village: string | null;
    district: string | null;
  };
  allocations?: Array<{
    id: string;
    labourerName: string;
    labourerPhone: string | null;
    skillset: string | null;
    dailyWage: number | null;
    isConfirmed: boolean;
    notes: string | null;
  }>;
}

export class ServiceOperationsApi {
  // Fertilizer Requests
  static async listFertilizerRequests(params?: { status?: string; cropType?: string; page?: number; limit?: number }): Promise<FertilizerRequestItem[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.cropType) query.append('cropType', params.cropType);
    if (params?.limit) query.append('limit', params.limit.toString());
    const res = await apiClient.get(`/fertilizer-requests?${query.toString()}`);
    return res.data?.data || [];
  }

  static async listFertilizers(params?: { status?: string; cropType?: string; search?: string; page?: number; limit?: number }): Promise<{ data: FertilizerRequestItem[]; total: number }> {
    const list = await this.listFertilizerRequests(params);
    const filtered = params?.search
      ? list.filter(
          (item) =>
            (item.farmer.name && item.farmer.name.toLowerCase().includes(params.search!.toLowerCase())) ||
            (item.farmer.phoneNumber && item.farmer.phoneNumber.includes(params.search!)) ||
            (item.cropType && item.cropType.toLowerCase().includes(params.search!.toLowerCase()))
        )
      : list;
    return { data: filtered, total: filtered.length };
  }

  static async getFertilizerRequestById(id: string): Promise<FertilizerRequestItem> {
    const res = await apiClient.get(`/fertilizer-requests/${id}`);
    return res.data?.data;
  }

  static async updateFertilizerStatus(id: string, status: string): Promise<FertilizerRequestItem> {
    const res = await apiClient.patch(`/fertilizer-requests/${id}/status`, { status });
    return res.data?.data;
  }

  static async assignFertilizerExpert(id: string, expertId: string): Promise<FertilizerRequestItem> {
    const res = await apiClient.post(`/fertilizer-requests/${id}/assign`, { expertId });
    return res.data?.data;
  }

  static async createFertilizerPlan(id: string, plan: FertilizerPlanPayload): Promise<any> {
    const res = await apiClient.post(`/fertilizer-requests/${id}/plan`, plan);
    return res.data?.data;
  }

  // Disease Requests
  static async listDiseaseRequests(params?: { status?: string; cropType?: string; page?: number; limit?: number }): Promise<DiseaseRequestItem[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.cropType) query.append('cropType', params.cropType);
    if (params?.limit) query.append('limit', params.limit.toString());
    const res = await apiClient.get(`/disease-requests?${query.toString()}`);
    return res.data?.data || [];
  }

  static async listDiseases(params?: { status?: string; cropType?: string; search?: string; page?: number; limit?: number }): Promise<{ data: DiseaseRequestItem[]; total: number }> {
    const list = await this.listDiseaseRequests(params);
    const filtered = params?.search
      ? list.filter(
          (item) =>
            (item.farmer.name && item.farmer.name.toLowerCase().includes(params.search!.toLowerCase())) ||
            (item.farmer.phoneNumber && item.farmer.phoneNumber.includes(params.search!)) ||
            (item.cropType && item.cropType.toLowerCase().includes(params.search!.toLowerCase()))
        )
      : list;
    return { data: filtered, total: filtered.length };
  }

  static async getDiseaseRequestById(id: string): Promise<DiseaseRequestItem> {
    const res = await apiClient.get(`/disease-requests/${id}`);
    return res.data?.data;
  }

  static async updateDiseaseStatus(id: string, status: string): Promise<DiseaseRequestItem> {
    const res = await apiClient.patch(`/disease-requests/${id}/status`, { status });
    return res.data?.data;
  }

  static async assignDiseaseExpert(id: string, expertId: string): Promise<DiseaseRequestItem> {
    const res = await apiClient.post(`/disease-requests/${id}/assign`, { expertId });
    return res.data?.data;
  }

  static async createDiseaseTreatment(id: string, treatment: DiseaseTreatmentPayload): Promise<any> {
    const res = await apiClient.post(`/disease-requests/${id}/treatment`, treatment);
    return res.data?.data;
  }

  // Labour Requests
  static async listLabourRequests(params?: { status?: string; taskType?: string; page?: number; limit?: number }): Promise<LabourRequestItem[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.taskType) query.append('taskType', params.taskType);
    if (params?.limit) query.append('limit', params.limit.toString());
    const res = await apiClient.get(`/labour-requests?${query.toString()}`);
    return res.data?.data || [];
  }

  static async listLabour(params?: { status?: string; taskType?: string; search?: string; page?: number; limit?: number }): Promise<{ data: LabourRequestItem[]; total: number }> {
    const list = await this.listLabourRequests(params);
    const filtered = params?.search
      ? list.filter(
          (item) =>
            (item.farmer.name && item.farmer.name.toLowerCase().includes(params.search!.toLowerCase())) ||
            (item.farmer.phoneNumber && item.farmer.phoneNumber.includes(params.search!)) ||
            (item.taskType && item.taskType.toLowerCase().includes(params.search!.toLowerCase()))
        )
      : list;
    return { data: filtered, total: filtered.length };
  }

  static async getLabourRequestById(id: string): Promise<LabourRequestItem> {
    const res = await apiClient.get(`/labour-requests/${id}`);
    return res.data?.data;
  }

  static async updateLabourStatus(id: string, status: string): Promise<LabourRequestItem> {
    const res = await apiClient.patch(`/labour-requests/${id}/status`, { status });
    return res.data?.data;
  }
}
