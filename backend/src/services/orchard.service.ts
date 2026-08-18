import { prisma } from '../config/db.js';
import { OrchardRequestStatus } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIO } from '../config/socket.js';

export interface CreateOrchardRequestDto {
  farmerId: string;
  photos: {
    front?: string;
    left?: string;
    right?: string;
    center?: string;
    gallery?: string[];
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
  surveyMapUrl?: string;
  surveyMapType?: string;
  preferences?: {
    budget?: number;
    expectedGoal?: string;
    preferredOrchards?: string[];
    needExpertSuggestion?: boolean;
    notes?: string;
  };
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
        surveyMapUrl: dto.surveyMapUrl,
        surveyMapType: dto.surveyMapType,
        photos: dto.photos as any,
        gps: dto.gps as any,
        landDetails: dto.landDetails as any,
        preferences: dto.preferences as any,
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

    // Broadcast to admin/expert dashboards in real-time
    try {
      const io = getIO();
      if (io) {
        io.to('room:staff').emit('new_orchard_request', request);
        console.log('[Socket.IO] 📢 Broadcasted new_orchard_request to staff room');
      }
    } catch (err) {
      console.warn('[OrchardService] Socket broadcast failed:', err);
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
   * Updates details of an orchard request
   */
  static async updateRequestDetails(id: string, details: any) {
    const request = await prisma.orchardRequest.findUnique({
      where: { id },
      include: { farmer: true }
    });

    if (!request) {
      throw new AppError('Orchard request not found', 404);
    }

    // Update Farmer
    if (details.farmerName || details.phoneNumber) {
      await prisma.farmer.update({
        where: { id: request.farmerId },
        data: {
          ...(details.farmerName ? { name: details.farmerName } : {}),
          ...(details.phoneNumber ? { phoneNumber: details.phoneNumber } : {})
        }
      });
    }

    // Prepare updated JSON fields
    const updatedGps = { ...(request.gps as any) };
    if (details.village !== undefined) updatedGps.village = details.village;
    if (details.district !== undefined) updatedGps.district = details.district;
    if (details.state !== undefined) updatedGps.state = details.state;

    const updatedLandDetails = { ...(request.landDetails as any) };
    if (details.landSize !== undefined) updatedLandDetails.size = details.landSize;
    if (details.soilType !== undefined) updatedLandDetails.soilType = details.soilType;
    if (details.waterSources !== undefined) updatedLandDetails.waterSources = details.waterSources;
    if (details.existingCrops !== undefined) updatedLandDetails.existingCrops = details.existingCrops;
    if (details.drip !== undefined) updatedLandDetails.drip = details.drip;
    if (details.electricity !== undefined) updatedLandDetails.electricity = details.electricity;

    const updatedRequest = await prisma.orchardRequest.update({
      where: { id },
      data: {
        gps: updatedGps,
        landDetails: updatedLandDetails,
      },
      include: {
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
          }
        },
        expert: true,
        report: true,
      }
    });

    return updatedRequest;
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

    // Broadcast status update to admin/expert dashboards in real-time
    try {
      const io = getIO();
      if (io) {
        io.to('room:staff').emit('updated_orchard_request', updated);
        console.log(`[Socket.IO] 📢 Broadcasted updated_orchard_request (${newStatus}) to staff room`);
      }
    } catch (err) {
      console.warn('[OrchardService] Socket broadcast failed:', err);
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
