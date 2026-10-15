import { apiClient } from './client.js';

export interface AgriProductListing {
  id: string;
  sellerId: string;
  productName?: string;
  variety?: string;
  minQuantity?: number;
  maxQuantity?: number;
  quantityUnit?: string;
  price?: number;
  priceUnit?: string;
  locationType: string;
  locationName?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  status: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  seller?: {
    id: string;
    name: string;
    phoneNumber?: string;
    village?: string;
    district?: string;
    state?: string;
  };
}

export interface AgriProductRequest {
  id: string;
  buyerId: string;
  productName: string;
  variety?: string;
  requiredQuantity: number;
  quantityUnit: string;
  expectedPrice?: number;
  priceUnit?: string;
  locationType: string;
  locationName?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  photos?: string[];
  status: string;
  adminNotes?: string;
  verifiedQuantity?: number;
  verifiedQuality?: string;
  procurementCost?: number;
  finalQuotePrice?: number;
  createdAt: string;
  buyer?: {
    id: string;
    name: string;
    phoneNumber?: string;
    village?: string;
    district?: string;
    state?: string;
  };
  matches?: {
    id: string;
    status: string;
    listing?: AgriProductListing;
  }[];
}

export interface CandidateMatch {
  listing: AgriProductListing;
  matchScore: number;
  quantityCompatible: boolean;
}

export const AgriBazaarApi = {
  // Seller Listings
  getListings: async (params?: {
    status?: string;
    productName?: string;
    sellerId?: string;
    phoneNumber?: string;
    district?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/agri-bazaar/listings', { params });
    return res.data;
  },

  getListing: async (id: string) => {
    const res = await apiClient.get(`/agri-bazaar/listings/${id}`);
    return res.data.data;
  },

  createListing: async (data: Partial<AgriProductListing> & { phoneNumber?: string }) => {
    const res = await apiClient.post('/agri-bazaar/listings', data);
    return res.data.data;
  },

  updateListing: async (id: string, data: Partial<AgriProductListing>) => {
    const res = await apiClient.put(`/agri-bazaar/listings/${id}`, data);
    return res.data.data;
  },

  deleteListing: async (id: string) => {
    const res = await apiClient.delete(`/agri-bazaar/listings/${id}`);
    return res.data;
  },

  // Buyer Requests
  getRequests: async (params?: {
    status?: string;
    productName?: string;
    buyerId?: string;
    phoneNumber?: string;
    district?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/agri-bazaar/requests', { params });
    return res.data;
  },

  getRequest: async (id: string) => {
    const res = await apiClient.get(`/agri-bazaar/requests/${id}`);
    return res.data.data;
  },

  createRequest: async (data: Partial<AgriProductRequest> & { phoneNumber?: string }) => {
    const res = await apiClient.post('/agri-bazaar/requests', data);
    return res.data.data;
  },

  updateRequest: async (id: string, data: Partial<AgriProductRequest>) => {
    const res = await apiClient.patch(`/agri-bazaar/requests/${id}`, data);
    return res.data.data;
  },

  cancelRequest: async (id: string) => {
    const res = await apiClient.delete(`/agri-bazaar/requests/${id}`);
    return res.data.data;
  },

  // Admin Operations
  updateStatus: async (
    id: string,
    data: {
      status: string;
      adminNotes?: string;
      verifiedQuantity?: number;
      verifiedQuality?: string;
      procurementCost?: number;
      finalQuotePrice?: number;
    }
  ) => {
    const res = await apiClient.patch(`/agri-bazaar/requests/${id}/status`, data);
    return res.data.data;
  },

  findMatches: async (requestId: string): Promise<{ request: AgriProductRequest; candidates: CandidateMatch[] }> => {
    const res = await apiClient.get(`/agri-bazaar/requests/${requestId}/matches`);
    return res.data.data;
  },

  createMatch: async (requestId: string, listingId: string, internalNotes?: string) => {
    const res = await apiClient.post(`/agri-bazaar/requests/${requestId}/match`, {
      listingId,
      internalNotes,
    });
    return res.data.data;
  },

  updateMatch: async (matchId: string, status: string, internalNotes?: string) => {
    const res = await apiClient.patch(`/agri-bazaar/matches/${matchId}`, {
      status,
      internalNotes,
    });
    return res.data.data;
  },

  // Image Upload with Cloudinary signature & fallback
  uploadPhoto: async (file: File): Promise<string> => {
    try {
      const signRes = await apiClient.post('/uploads/sign', { folder: 'agri_bazaar_photos' });
      const { signature, timestamp, apiKey, cloudName, folder } = signRes.data.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        return data.secure_url;
      }
    } catch {
      // Fallback: Read as base64 data URL
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
