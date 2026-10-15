import { prisma } from '../config/db.js';
import { LabourRequestStatus, LabourTaskType } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIO } from '../config/socket.js';
import { UploadService } from './upload.service.js';

export interface CreateLabourRequestDto {
  farmerId: string;
  taskType?: LabourTaskType;
  taskDescription?: string;
  cropType?: string;
  landAcres?: number;
  labourersRequired?: number;
  preferredStartDate?: string;
  preferredEndDate?: string;
  durationDays?: number;
  dailyWage?: number;
  totalBudget?: number;
  mealsProvided?: boolean;
  transportProvided?: boolean;
  gps?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
  };
  voiceNoteUrl?: string;
  voiceText?: string;
  photos?: string[] | Record<string, any>;
  specialRequirements?: string;
  notes?: string;
  urgency?: string;
}

export interface CreateLabourAllocationDto {
  labourerName: string;
  labourerPhone?: string;
  skillset?: string;
  dailyWage?: number;
  startDate?: string;
  endDate?: string;
  daysWorked?: number;
  totalPaid?: number;
  isConfirmed?: boolean;
  notes?: string;
}

export interface LabourCatalogItem {
  taskType: string;
  teluguName?: string;
  hindiName?: string;
  description: string;
  typicalDailyWage: string;
  season: string;
  skillsRequired: string[];
  estimatedLabourersPerAcre: number;
}

export class LabourService {
  /**
   * Submit new Labour request from farmer
   */
  static async createRequest(dto: CreateLabourRequestDto) {
    // 1. Verify farmer exists
    const farmer = await prisma.farmer.findUnique({
      where: { id: dto.farmerId },
      select: { id: true, name: true, phoneNumber: true, village: true, state: true },
    });

    if (!farmer) {
      throw new AppError('Farmer profile not found for the provided ID', 404);
    }

    // 2. Format photos & gps
    const photosData = dto.photos
      ? (Array.isArray(dto.photos) ? dto.photos : dto.photos)
      : [];
    const gpsData = dto.gps || {};

    // 2.1 Automatically save voice note data URL if needed
    let voiceUrl = dto.voiceNoteUrl;
    if (voiceUrl && voiceUrl.startsWith('data:audio')) {
      try {
        const saved = await UploadService.saveAudio(voiceUrl);
        voiceUrl = saved.url;
      } catch (err) {
        // Fallback to storing as is
      }
    }

    // 3. Create labour request in PostgreSQL
    const request = await prisma.labourRequest.create({
      data: {
        farmerId: dto.farmerId,
        taskType: dto.taskType || 'OTHER',
        taskDescription: dto.taskDescription || dto.voiceText || 'Labour requirement submitted by farmer',
        cropType: dto.cropType,
        landAcres: dto.landAcres ? Number(dto.landAcres) : null,
        labourersRequired: dto.labourersRequired ? Number(dto.labourersRequired) : 1,
        preferredStartDate: dto.preferredStartDate ? new Date(dto.preferredStartDate) : null,
        preferredEndDate: dto.preferredEndDate ? new Date(dto.preferredEndDate) : null,
        durationDays: dto.durationDays ? Number(dto.durationDays) : null,
        dailyWage: dto.dailyWage ? Number(dto.dailyWage) : null,
        totalBudget: dto.totalBudget ? Number(dto.totalBudget) : null,
        mealsProvided: dto.mealsProvided || false,
        transportProvided: dto.transportProvided || false,
        gps: gpsData as any,
        voiceNoteUrl: voiceUrl,
        voiceText: dto.voiceText || (voiceUrl ? 'Voice note attached' : null),
        photos: photosData as any,
        specialRequirements: dto.specialRequirements,
        notes: dto.notes,
        urgency: dto.urgency || 'NORMAL',
        status: LabourRequestStatus.SUBMITTED,
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
          },
        },
      },
    });

    // 4. Send instant confirmation notification to farmer
    try {
      await NotificationService.sendNotification({
        farmerId: dto.farmerId,
        title: 'Labour Request Submitted Successfully',
        body: `Your request for ${dto.labourersRequired || 1} labourer(s) for ${dto.taskType || 'farm work'} has been registered. We are connecting you with available workers.`,
        type: 'SUCCESS',
        deepLink: '/labour-requests',
      });
    } catch (notifErr) {
      console.warn('[LabourService] Failed to dispatch push notification:', notifErr);
    }

    // 5. Emit real-time notification to experts via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.emit('new-labour-request', {
          requestId: request.id,
          farmerName: farmer.name,
          taskType: request.taskType,
          labourersRequired: request.labourersRequired,
          location: (gpsData as any).village || (gpsData as any).district || 'Unknown',
          urgency: request.urgency,
          submittedAt: request.submittedAt,
        });
      }
    } catch {
      // Socket may not be initialized in test environment
    }

    return request;
  }

  /**
   * List labour requests with filters & pagination
   */
  static async getRequests(filters: {
    farmerId?: string;
    expertId?: string;
    status?: LabourRequestStatus;
    taskType?: LabourTaskType;
    urgency?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.farmerId) where.farmerId = filters.farmerId;
    if (filters.expertId) where.expertId = filters.expertId;
    if (filters.status) where.status = filters.status;
    if (filters.taskType) where.taskType = filters.taskType;
    if (filters.urgency) where.urgency = filters.urgency;

    const [total, items] = await Promise.all([
      prisma.labourRequest.count({ where }),
      prisma.labourRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              village: true,
              district: true,
              state: true,
            },
          },
          expert: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              specialization: true,
              rating: true,
            },
          },
          allocations: true,
        },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single labour request by ID
   */
  static async getRequestById(id: string) {
    const request = await prisma.labourRequest.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
            photoUrl: true,
          },
        },
        expert: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            specialization: true,
            rating: true,
            photoUrl: true,
          },
        },
        allocations: true,
      },
    });

    if (!request) {
      throw new AppError(`Labour request with ID ${id} not found`, 404);
    }

    return request;
  }

  /**
   * Update request status (e.g. UNDER_REVIEW, IN_PROGRESS, COMPLETED)
   */
  static async updateStatus(id: string, status: LabourRequestStatus, expertId?: string) {
    const existing = await prisma.labourRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(`Labour request ${id} not found`, 404);
    }

    const updateData: any = { status };
    if (expertId && !existing.expertId) {
      const expertRecord = await prisma.expert.findUnique({ where: { id: expertId } });
      if (expertRecord) {
        updateData.expertId = expertId;
      }
    }

    const updated = await prisma.labourRequest.update({
      where: { id },
      data: updateData,
      include: {
        farmer: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true } },
        allocations: true,
      },
    });

    // Notify farmer of status progression
    try {
      let statusMsg = `Your labour request status is now ${status.replace('_', ' ')}.`;
      if (status === LabourRequestStatus.UNDER_REVIEW) {
        statusMsg = 'Your labour request is being reviewed. We are looking for available workers in your area.';
      } else if (status === LabourRequestStatus.APPROVED) {
        statusMsg = 'Your labour request has been approved! Workers will be assigned shortly.';
      } else if (status === LabourRequestStatus.LABOURERS_ASSIGNED) {
        statusMsg = 'Labourers have been assigned to your farm task. Check the details in the app.';
      } else if (status === LabourRequestStatus.IN_PROGRESS) {
        statusMsg = 'The assigned labourers have started working on your farm.';
      } else if (status === LabourRequestStatus.COMPLETED) {
        statusMsg = 'Your labour request has been completed. Thank you for using Kisan Mithar!';
      }

      await NotificationService.sendNotification({
        farmerId: existing.farmerId,
        title: `Labour Request Update: ${status}`,
        body: statusMsg,
        type: 'INFO',
        deepLink: '/labour-requests',
      });
    } catch (err) {
      console.warn('[LabourService] Status notification error:', err);
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('labour-request-updated', { id, status });
      }
    } catch {}

    return updated;
  }

  /**
   * Assign an Expert (coordinator) to a request
   */
  static async assignExpert(id: string, expertId: string) {
    const [request, expert] = await Promise.all([
      prisma.labourRequest.findUnique({ where: { id } }),
      prisma.expert.findUnique({ where: { id: expertId } }),
    ]);

    if (!request) {
      throw new AppError(`Labour request ${id} not found`, 404);
    }
    if (!expert) {
      throw new AppError(`Expert with ID ${expertId} not found`, 404);
    }

    const updated = await prisma.labourRequest.update({
      where: { id },
      data: {
        expertId,
        status: LabourRequestStatus.UNDER_REVIEW,
      },
      include: {
        farmer: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true, specialization: true } },
      },
    });

    try {
      await NotificationService.sendNotification({
        farmerId: request.farmerId,
        title: 'Coordinator Assigned to Your Labour Request',
        body: `${expert.name} (${expert.specialization}) has been assigned to coordinate labourers for your farm task.`,
        type: 'INFO',
        deepLink: '/labour-requests',
      });
    } catch {}

    return updated;
  }

  /**
   * Add labourer allocations to a request
   */
  static async addAllocations(
    requestId: string,
    allocations: CreateLabourAllocationDto[],
    expertId?: string
  ) {
    const request = await prisma.labourRequest.findUnique({
      where: { id: requestId },
      include: { farmer: true },
    });

    if (!request) {
      throw new AppError(`Labour request ${requestId} not found`, 404);
    }

    // Create allocations
    const createdAllocations = await Promise.all(
      allocations.map((alloc) =>
        prisma.labourAllocation.create({
          data: {
            labourRequestId: requestId,
            labourerName: alloc.labourerName,
            labourerPhone: alloc.labourerPhone,
            skillset: alloc.skillset,
            dailyWage: alloc.dailyWage ? Number(alloc.dailyWage) : null,
            startDate: alloc.startDate ? new Date(alloc.startDate) : null,
            endDate: alloc.endDate ? new Date(alloc.endDate) : null,
            daysWorked: alloc.daysWorked ? Number(alloc.daysWorked) : null,
            totalPaid: alloc.totalPaid ? Number(alloc.totalPaid) : null,
            isConfirmed: alloc.isConfirmed || false,
            notes: alloc.notes,
          },
        })
      )
    );

    // Advance request status to LABOURERS_ASSIGNED
    const updateData: any = { status: LabourRequestStatus.LABOURERS_ASSIGNED };
    if (expertId && !request.expertId) {
      const expertRecord = await prisma.expert.findUnique({ where: { id: expertId } });
      if (expertRecord) {
        updateData.expertId = expertId;
      }
    }

    await prisma.labourRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Send notification to farmer
    try {
      const labourerNames = createdAllocations.map((a) => a.labourerName).join(', ');
      await NotificationService.sendNotification({
        farmerId: request.farmerId,
        title: '👷 Labourers Assigned to Your Farm!',
        body: `${createdAllocations.length} labourer(s) assigned: ${labourerNames}. Check the app for contact details.`,
        type: 'ALERT',
        deepLink: '/labour-requests',
      });
    } catch (notifErr) {
      console.warn('[LabourService] Failed to notify farmer of allocation:', notifErr);
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('labour-allocation-created', {
          requestId,
          allocationCount: createdAllocations.length,
        });
      }
    } catch {}

    return createdAllocations;
  }

  /**
   * Update a single labourer allocation
   */
  static async updateAllocation(allocationId: string, data: Partial<CreateLabourAllocationDto>) {
    const existing = await prisma.labourAllocation.findUnique({
      where: { id: allocationId },
    });

    if (!existing) {
      throw new AppError(`Labour allocation ${allocationId} not found`, 404);
    }

    const updated = await prisma.labourAllocation.update({
      where: { id: allocationId },
      data: {
        ...(data.labourerName !== undefined && { labourerName: data.labourerName }),
        ...(data.labourerPhone !== undefined && { labourerPhone: data.labourerPhone }),
        ...(data.skillset !== undefined && { skillset: data.skillset }),
        ...(data.dailyWage !== undefined && { dailyWage: Number(data.dailyWage) }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.daysWorked !== undefined && { daysWorked: Number(data.daysWorked) }),
        ...(data.totalPaid !== undefined && { totalPaid: Number(data.totalPaid) }),
        ...(data.isConfirmed !== undefined && { isConfirmed: data.isConfirmed }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return updated;
  }

  /**
   * Delete a labourer allocation
   */
  static async deleteAllocation(allocationId: string) {
    const existing = await prisma.labourAllocation.findUnique({
      where: { id: allocationId },
    });

    if (!existing) {
      throw new AppError(`Labour allocation ${allocationId} not found`, 404);
    }

    await prisma.labourAllocation.delete({
      where: { id: allocationId },
    });

    return { message: 'Labour allocation removed successfully' };
  }

  /**
   * Delete labour request (Farmer or Admin)
   */
  static async deleteRequest(id: string, userId: string, role: string) {
    const request = await prisma.labourRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new AppError(`Labour request ${id} not found`, 404);
    }

    if (role === 'FARMER' && request.farmerId !== userId) {
      throw new AppError('Forbidden: You can only delete your own requests', 403);
    }

    await prisma.labourRequest.delete({
      where: { id },
    });

    return { message: 'Labour request deleted successfully' };
  }

  /**
   * Get Labour Task Catalog — typical farm labour tasks with wage guidelines
   */
  static getLabourCatalog(taskQuery?: string): LabourCatalogItem[] {
    const catalog: LabourCatalogItem[] = [
      {
        taskType: 'PLOUGHING',
        teluguName: 'దుక్కి (Dukki)',
        hindiName: 'जुताई (Jutai)',
        description: 'Land preparation by ploughing with tractor or bullock. Includes deep ploughing, cross ploughing, and levelling.',
        typicalDailyWage: '₹400–600/day (manual), ₹1,500–2,500/acre (tractor)',
        season: 'Pre-sowing (June–July, Oct–Nov)',
        skillsRequired: ['Tractor driving', 'Bullock management', 'Land levelling'],
        estimatedLabourersPerAcre: 1,
      },
      {
        taskType: 'SOWING',
        teluguName: 'విత్తనం వేయడం (Vittanam Veyadam)',
        hindiName: 'बुआई (Buai)',
        description: 'Sowing seeds in prepared beds/furrows. Includes dibbling, broadcasting, and transplanting seedlings.',
        typicalDailyWage: '₹350–500/day',
        season: 'Kharif (June–July), Rabi (Oct–Nov)',
        skillsRequired: ['Seed spacing knowledge', 'Row planting', 'Nursery handling'],
        estimatedLabourersPerAcre: 4,
      },
      {
        taskType: 'TRANSPLANTING',
        teluguName: 'నాట్లు వేయడం (Natlu Veyadam)',
        hindiName: 'रोपाई (Ropai)',
        description: 'Transplanting seedlings from nursery to main field, especially for paddy, vegetables, and chilli.',
        typicalDailyWage: '₹350–500/day',
        season: 'Kharif (July–Aug), Rabi (Nov–Dec)',
        skillsRequired: ['Paddy transplanting', 'Spacing knowledge', 'Nursery handling'],
        estimatedLabourersPerAcre: 6,
      },
      {
        taskType: 'WEEDING',
        teluguName: 'కలుపు తీయడం (Kalupu Teeyadam)',
        hindiName: 'निराई (Nirai)',
        description: 'Removing weeds manually or with tools. Critical for crop health during vegetative growth stage.',
        typicalDailyWage: '₹300–450/day',
        season: 'All season (2–4 weeks after sowing)',
        skillsRequired: ['Weed identification', 'Hand hoeing', 'Tool handling'],
        estimatedLabourersPerAcre: 5,
      },
      {
        taskType: 'SPRAYING',
        teluguName: 'మందు కొట్టడం (Mandu Kottadam)',
        hindiName: 'छिड़काव (Chhidkav)',
        description: 'Pesticide/fungicide/fertilizer spraying using manual or power sprayers. Requires safety equipment.',
        typicalDailyWage: '₹400–600/day',
        season: 'All season (as needed)',
        skillsRequired: ['Sprayer operation', 'Chemical mixing', 'Safety protocols', 'Nozzle calibration'],
        estimatedLabourersPerAcre: 2,
      },
      {
        taskType: 'HARVESTING',
        teluguName: 'కోత (Kota)',
        hindiName: 'कटाई (Katai)',
        description: 'Cutting and collecting the mature crop. Includes threshing, cleaning, and bagging.',
        typicalDailyWage: '₹400–700/day',
        season: 'Kharif (Oct–Dec), Rabi (Mar–Apr)',
        skillsRequired: ['Sickle handling', 'Combine operation', 'Grain separation'],
        estimatedLabourersPerAcre: 5,
      },
      {
        taskType: 'IRRIGATION',
        teluguName: 'నీటి పారుదల (Neeti Parudala)',
        hindiName: 'सिंचाई (Sinchai)',
        description: 'Managing water channels, drip lines, sprinklers, or flood irrigation across the field.',
        typicalDailyWage: '₹350–500/day',
        season: 'All season',
        skillsRequired: ['Drip maintenance', 'Channel management', 'Motor/pump operation'],
        estimatedLabourersPerAcre: 1,
      },
      {
        taskType: 'PRUNING',
        teluguName: 'కత్తిరించడం (Kattirimchadam)',
        hindiName: 'छंटाई (Chhantai)',
        description: 'Pruning branches of fruit trees, removing dead wood, and shaping canopy for better yield.',
        typicalDailyWage: '₹400–600/day',
        season: 'Post-harvest (Dec–Feb for mangoes)',
        skillsRequired: ['Pruning techniques', 'Tree climbing', 'Tool sharpening'],
        estimatedLabourersPerAcre: 3,
      },
      {
        taskType: 'LOADING_UNLOADING',
        teluguName: 'ఎక్కించడం/దింపడం (Ekkinchdam/Dimpadam)',
        hindiName: 'लदाई/उतराई (Ladai/Utrai)',
        description: 'Loading harvested produce onto trucks/carts and unloading at market yards (mandis).',
        typicalDailyWage: '₹350–600/day',
        season: 'Post-harvest',
        skillsRequired: ['Heavy lifting', 'Stacking', 'Transport coordination'],
        estimatedLabourersPerAcre: 3,
      },
      {
        taskType: 'FENCING',
        teluguName: 'కంచె వేయడం (Kanche Veyadam)',
        hindiName: 'बाड़ लगाना (Baad Lagana)',
        description: 'Building or repairing farm boundary fencing using wire, bamboo, or concrete posts.',
        typicalDailyWage: '₹400–600/day',
        season: 'Any season (usually pre-sowing)',
        skillsRequired: ['Wire cutting', 'Post digging', 'Concrete mixing'],
        estimatedLabourersPerAcre: 2,
      },
    ];

    if (taskQuery) {
      return catalog.filter(
        (item) =>
          item.taskType.toLowerCase().includes(taskQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(taskQuery.toLowerCase())
      );
    }

    return catalog;
  }
}
