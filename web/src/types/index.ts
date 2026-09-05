export type UserRole = 'EXPERT' | 'ADMIN';

export type OrchardStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'EXPERT_ASSIGNED'
  | 'PLAN_READY'
  | 'COMPLETED';

export type ConsultationMode = 'VOICE' | 'VIDEO' | 'CHAT';
export type ConsultationStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface UserSession {
  userId: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  token: string;
  avatarUrl?: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phoneNumber: string;
  village?: string;
  district?: string;
  state?: string;
  landAcres?: number;
  primaryCrop?: string;
  languageCode?: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  specialization: string;
  experienceYears: number;
  rating: number;
  photoUrl?: string;
}

export interface OrchardRequest {
  id: string;
  farmerId: string;
  expertId?: string;
  status: OrchardStatus;
  farmer?: FarmerProfile;
  expert?: ExpertProfile;
  photos: {
    front?: string;
    left?: string;
    right?: string;
    center?: string;
  };
  gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    village?: string;
    district?: string;
    state?: string;
  };
  landDetails: {
    size: string;
    soilType: string;
    waterSources: string[];
    electricity: boolean;
    drip: boolean;
    existingCrops: string[];
  };
  notes?: string;
  voiceNoteUrl?: string;
  submittedAt: string;
  updatedAt: string;
  report?: OrchardReport;
}

export interface RecommendedVariety {
  crop: string;
  variety: string;
  yieldPerAcre: string;
  plantingSeason: string;
}

export interface OrchardReport {
  id: string;
  orchardRequestId: string;
  summary: string;
  recommendedVarieties: RecommendedVariety[];
  plantationLayout: {
    rowSpacingMeters: number;
    plantSpacingMeters: number;
    totalPlantsEstimate: number;
  };
  soilTreatment: string;
  fertilizerSchedule: string;
  waterRequirement: string;
  dripLayout: string;
  estimatedBudget: number;
  projectedRoi: string;
  implementationTimeline: string;
  pestControl: string;
  governmentSchemes: string;
  maintenanceCalendar: string;
  pdfUrl?: string;
  generatedAt: string;
}

export interface ConsultationItem {
  id: string;
  farmerId: string;
  expertId?: string;
  mode: ConsultationMode;
  category: string;
  scheduledAt: string;
  language: string;
  status: ConsultationStatus;
  notes?: string;
  mediaUrls?: string[];
  voiceNoteUrl?: string;
  prescription?: {
    diagnosis: string;
    medicines: string[];
    followUpNotes: string;
  };
  farmer?: FarmerProfile;
  expert?: ExpertProfile;
}

export interface AnalyticsSummary {
  totalRequests: number;
  pendingReviews: number;
  reportsCompleted: number;
  activeConsultations: number;
  avgTurnaroundDays: number;
  farmerSatisfaction: number;
  statusBreakdown: Record<OrchardStatus, number>;
  cropDemand: Array<{ crop: string; percentage: number }>;
}
