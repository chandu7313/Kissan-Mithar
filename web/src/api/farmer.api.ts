import { apiClient } from './client.js';

export interface FarmerListItem {
  id: string;
  name: string;
  phoneNumber: string;
  village: string | null;
  district: string | null;
  state: string | null;
  landAcres: number | null;
  primaryCrop: string | null;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
  devices: Array<{ platform: string; lastActive: string }>;
  _count: {
    orchardRequests: number;
    consultations: number;
    fertilizerRequests: number;
    diseaseRequests: number;
    labourRequests: number;
    agriProductListings: number;
    agriProductRequests: number;
  };
}

export interface FarmerDossier extends FarmerListItem {
  orchardRequests: Array<{
    id: string;
    status: string;
    submittedAt: string;
    landDetails: any;
    expert?: { name: string; specialization: string } | null;
  }>;
  fertilizerRequests: Array<{
    id: string;
    status: string;
    cropType: string | null;
    landAcres: number | null;
    soilType: string | null;
    submittedAt: string;
    expert?: { name: string } | null;
  }>;
  diseaseRequests: Array<{
    id: string;
    status: string;
    cropType: string | null;
    affectedPart: string | null;
    submittedAt: string;
    treatment?: { diseaseName: string; severity: string } | null;
  }>;
  labourRequests: Array<{
    id: string;
    status: string;
    taskType: string;
    labourersRequired: number;
    dailyWage: number | null;
    submittedAt: string;
  }>;
  agriProductListings: Array<{
    id: string;
    productName: string | null;
    variety: string | null;
    price: number | null;
    priceUnit: string | null;
    status: string;
    createdAt: string;
  }>;
  agriProductRequests: Array<{
    id: string;
    productName: string;
    requiredQuantity: number;
    quantityUnit: string;
    status: string;
    createdAt: string;
  }>;
  consultations: Array<{
    id: string;
    category: string;
    mode: string;
    status: string;
    scheduledAt: string;
    expert?: { name: string } | null;
  }>;
}

export interface ListFarmersParams {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
  state?: string;
  primaryCrop?: string;
  sortBy?: 'createdAt' | 'name' | 'landAcres';
  sortOrder?: 'asc' | 'desc';
}

export interface ListFarmersResponse {
  success: boolean;
  count: number;
  data: FarmerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class FarmerApi {
  static async listFarmers(params?: ListFarmersParams): Promise<ListFarmersResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.district) query.append('district', params.district);
    if (params?.state) query.append('state', params.state);
    if (params?.primaryCrop) query.append('primaryCrop', params.primaryCrop);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/farmers?${query.toString()}`);
    return response.data;
  }

  static async list(params?: ListFarmersParams): Promise<{ data: FarmerListItem[]; total: number }> {
    const res = await this.listFarmers(params);
    return { data: res.data || [], total: res.pagination?.total ?? res.count ?? 0 };
  }

  static async getFarmerById(id: string): Promise<FarmerDossier> {
    const response = await apiClient.get(`/farmers/${id}`);
    return response.data?.data;
  }

  static async getDossier(id: string): Promise<FarmerDossier> {
    return this.getFarmerById(id);
  }

  static async updateFarmer(id: string, data: Partial<FarmerListItem>): Promise<FarmerListItem> {
    const response = await apiClient.patch(`/farmers/${id}`, data);
    return response.data?.data;
  }

  static async updateByAdmin(id: string, data: Partial<FarmerListItem>): Promise<FarmerListItem> {
    return this.updateFarmer(id, data);
  }
}
