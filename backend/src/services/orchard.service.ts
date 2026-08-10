import { prisma } from '../config/db.js';
import { OrchardRequestStatus } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';

export interface CreateOrchardRequestDto {
  farmerId: string;
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
}

export interface CreateOrchardReportDto {
  summary: string;
  recommendedVarieties: Array<{
    crop: string;
    variety: string;
    yieldPerAcre: string;
    plantingSeason: string;
  }>;
  plantationLayout: {
    rowSpacingMeters: number;
    plantSpacingMeters: number;
    totalPlantsEstimate: number;
  };
  waterRequirement: string;
  soilTreatment: string;
  fertilizerSchedule?: string;
  pestControl: string;
  estimatedBudget: number;
  projectedRoi?: string;
  implementationTimeline?: string;
  governmentSchemes?: string;
  maintenanceCalendar?: string;
  pdfUrl?: string;
}

export class OrchardService {
  /**
   * Creates a new Orchard Planning survey submission
   */
  static async createRequest(dto: CreateOrchardRequestDto) {
    const request = await prisma.orchardRequest.create({
      data: {
        farmerId: dto.farmerId,
        photos: dto.photos as any,
        gps: dto.gps as any,
        landDetails: dto.landDetails as any,
        notes: dto.notes,
        voiceNoteUrl: dto.voiceNoteUrl,
        status: 'SUBMITTED',
      },
      include: {
        farmer: { select: { id: true, name: true, phoneNumber: true, village: true } },
      },
    });

    // Send confirmation notification
    try {
      await NotificationService.sendNotification({
        farmerId: dto.farmerId,
        title: 'Orchard Survey Submitted Successfully',
        body: 'Your land survey has been received. Our horticultural experts are reviewing your soil & layout.',
        type: 'SUCCESS',
        deepLink: '/orchard/plan-tracker',
        data: { requestId: request.id },
      });
    } catch (err) {
      console.warn('[OrchardService] Notification send failed:', err);
    }

    return request;
  }

  /**
   * Retrieves list of orchard requests with full relations
   */
  static async getRequests(filter: {
    farmerId?: string;
    expertId?: string;
    status?: OrchardRequestStatus;
  }) {
    return await prisma.orchardRequest.findMany({
      where: {
        ...(filter.farmerId ? { farmerId: filter.farmerId } : {}),
        ...(filter.expertId ? { expertId: filter.expertId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      include: {
        report: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
            landAcres: true,
            primaryCrop: true,
          },
        },
        expert: {
          select: {
            id: true,
            name: true,
            specialization: true,
            rating: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Retrieves a single orchard request by ID with all related data
   */
  static async getRequestById(id: string) {
    const request = await prisma.orchardRequest.findUnique({
      where: { id },
      include: {
        report: true,
        expert: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
            landAcres: true,
            primaryCrop: true,
          },
        },
      },
    });

    if (!request) {
      throw new AppError('Orchard request not found', 404);
    }

    return request;
  }

  /**
   * Updates status of an orchard request
   */
  static async updateStatus(
    id: string,
    newStatus: OrchardRequestStatus,
    expertId?: string
  ) {
    const updated = await prisma.orchardRequest.update({
      where: { id },
      data: {
        status: newStatus,
        ...(expertId ? { expertId } : {}),
      },
      include: {
        farmer: true,
        expert: true,
      },
    });

    // Status change push notification
    const statusNotificationMap: Record<OrchardRequestStatus, { title: string; body: string }> = {
      SUBMITTED: {
        title: 'Orchard Plan Submitted',
        body: 'Your orchard request is in queue.',
      },
      UNDER_REVIEW: {
        title: 'Survey Under Review',
        body: 'Our agronomist is analyzing your soil type, GPS boundary, and water sources.',
      },
      EXPERT_ASSIGNED: {
        title: 'Expert Assigned',
        body: `A horticulture specialist${updated.expert ? ` (${updated.expert.name})` : ''} has been assigned to craft your plantation plan.`,
      },
      PLAN_READY: {
        title: 'Your Orchard Plan is Ready!',
        body: 'Tap to view your complete tree layout, water schedule, and estimated yield report.',
      },
      COMPLETED: {
        title: 'Orchard Plan Finalized',
        body: 'Your plantation design has been finalized. Download your PDF report anytime.',
      },
    };

    const notif = statusNotificationMap[newStatus];
    if (notif && updated.farmerId) {
      try {
        await NotificationService.sendNotification({
          farmerId: updated.farmerId,
          title: notif.title,
          body: notif.body,
          type: newStatus === 'PLAN_READY' ? 'SUCCESS' : 'INFO',
          deepLink: newStatus === 'PLAN_READY' ? '/orchard/report' : '/orchard/plan-tracker',
          data: { requestId: id, status: newStatus },
        });
      } catch (err) {
        console.warn('[OrchardService] Notification send failed:', err);
      }
    }

    return updated;
  }

  /**
   * Creates or updates an expert-generated OrchardReport
   */
  static async createReport(orchardRequestId: string, dto: CreateOrchardReportDto) {
    const report = await prisma.orchardReport.upsert({
      where: { orchardRequestId },
      update: {
        summary: dto.summary,
        recommendedVarieties: dto.recommendedVarieties as any,
        plantationLayout: dto.plantationLayout as any,
        waterRequirement: dto.waterRequirement,
        soilTreatment: dto.soilTreatment,
        fertilizerSchedule: dto.fertilizerSchedule,
        pestControl: dto.pestControl,
        estimatedBudget: dto.estimatedBudget,
        projectedRoi: dto.projectedRoi,
        implementationTimeline: dto.implementationTimeline,
        governmentSchemes: dto.governmentSchemes,
        maintenanceCalendar: dto.maintenanceCalendar,
        pdfUrl: dto.pdfUrl,
      },
      create: {
        orchardRequestId,
        summary: dto.summary,
        recommendedVarieties: dto.recommendedVarieties as any,
        plantationLayout: dto.plantationLayout as any,
        waterRequirement: dto.waterRequirement,
        soilTreatment: dto.soilTreatment,
        fertilizerSchedule: dto.fertilizerSchedule,
        pestControl: dto.pestControl,
        estimatedBudget: dto.estimatedBudget,
        projectedRoi: dto.projectedRoi,
        implementationTimeline: dto.implementationTimeline,
        governmentSchemes: dto.governmentSchemes,
        maintenanceCalendar: dto.maintenanceCalendar,
        pdfUrl: dto.pdfUrl,
      },
    });

    // Advance status to PLAN_READY
    await this.updateStatus(orchardRequestId, 'PLAN_READY');

    return report;
  }
}
