import { prisma } from '../config/db.js';
import { FertilizerRequestStatus } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIO } from '../config/socket.js';
import { UploadService } from './upload.service.js';

export interface CreateFertilizerRequestDto {
  farmerId: string;
  cropType?: string;
  cropAge?: string;
  landAcres?: number;
  soilType?: string;
  problemCategory?: string;
  issueDescription?: string;
  voiceNoteUrl?: string;
  voiceText?: string;
  photos: string[] | Record<string, any>;
  gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
  };
  previousFertilizers?: string;
  irrigationType?: string;
  notes?: string;
}

export interface CreateFertilizerPlanDto {
  diagnosis: string;
  summary: string;
  schedule: Array<{
    stage: string;
    timing: string;
    fertilizers: Array<{
      name: string;
      dosage: string;
      method: string;
    }>;
    notes?: string;
  }>;
  organicAlternatives?: string;
  soilTreatment?: string;
  precautions?: string;
  estimatedBudget?: number;
  pdfUrl?: string;
}

export interface FertilizerCatalogItem {
  crop: string;
  teluguName?: string;
  hindiName?: string;
  recommendedNPK: string;
  stages: Array<{
    stage: string;
    timing: string;
    recommendation: string;
    dripOrFoliar?: string;
  }>;
  commonDeficiencies: Array<{
    nutrient: string;
    symptom: string;
    correction: string;
  }>;
  bioFertilizers: string[];
}

export class FertilizerService {
  /**
   * Submit new Fertilizer Guide request from farmer
   */
  static async createRequest(dto: CreateFertilizerRequestDto) {
    // 1. Verify farmer exists
    const farmer = await prisma.farmer.findUnique({
      where: { id: dto.farmerId },
      select: { id: true, name: true, phoneNumber: true, village: true, state: true },
    });

    if (!farmer) {
      throw new AppError('Farmer profile not found for the provided ID', 404);
    }

    // 2. Format photos & gps
    const photosData = Array.isArray(dto.photos) ? dto.photos : (dto.photos as any);
    const gpsData = dto.gps;

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

    const issueText =
      dto.issueDescription ||
      dto.voiceText ||
      (voiceUrl ? 'Voice note recording attached by farmer' : 'Crop inquiry submitted by farmer');

    // 3. Create fertilizer request in PostgreSQL
    const request = await prisma.fertilizerRequest.create({
      data: {
        farmerId: dto.farmerId,
        cropType: dto.cropType || 'Crop (Pending Analysis)',
        cropAge: dto.cropAge,
        landAcres: dto.landAcres ? Number(dto.landAcres) : null,
        soilType: dto.soilType,
        problemCategory: dto.problemCategory,
        issueDescription: issueText,
        voiceNoteUrl: voiceUrl,
        voiceText: dto.voiceText || (voiceUrl ? 'Voice note attached' : null),
        photos: photosData,
        gps: gpsData,
        previousFertilizers: dto.previousFertilizers,
        irrigationType: dto.irrigationType,
        notes: dto.notes,
        status: FertilizerRequestStatus.SUBMITTED,
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
        title: 'Fertilizer Inquiry Submitted Successfully',
        body: 'Your fertilizer request has been registered. Our agronomists are reviewing your soil & crop photos.',
        type: 'SUCCESS',
        deepLink: '/fertilizer-guide',
      });
    } catch (notifErr) {
      console.warn('[FertilizerService] Failed to dispatch push notification:', notifErr);
    }

    // 5. Emit real-time notification to experts via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.emit('new-fertilizer-request', {
          requestId: request.id,
          farmerName: farmer.name,
          cropType: request.cropType,
          location: gpsData.village || gpsData.district || 'Unknown',
          submittedAt: request.submittedAt,
        });
      }
    } catch {
      // Socket may not be initialized in test environment
    }

    return request;
  }

  /**
   * List fertilizer requests with filters & pagination
   */
  static async getRequests(filters: {
    farmerId?: string;
    expertId?: string;
    status?: FertilizerRequestStatus;
    cropType?: string;
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
    if (filters.cropType) {
      where.cropType = { contains: filters.cropType, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      prisma.fertilizerRequest.count({ where }),
      prisma.fertilizerRequest.findMany({
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
          plan: true,
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
   * Get single fertilizer request by ID
   */
  static async getRequestById(id: string) {
    const request = await prisma.fertilizerRequest.findUnique({
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
        plan: true,
      },
    });

    if (!request) {
      throw new AppError(`Fertilizer request with ID ${id} not found`, 404);
    }

    return request;
  }

  /**
   * Update request status (e.g. UNDER_REVIEW, COMPLETED)
   */
  static async updateStatus(id: string, status: FertilizerRequestStatus, expertId?: string) {
    const existing = await prisma.fertilizerRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(`Fertilizer request ${id} not found`, 404);
    }

    const updateData: any = { status };
    if (expertId && !existing.expertId) {
      const expertRecord = await prisma.expert.findUnique({ where: { id: expertId } });
      if (expertRecord) {
        updateData.expertId = expertId;
      }
    }

    const updated = await prisma.fertilizerRequest.update({
      where: { id },
      data: updateData,
      include: {
        farmer: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true } },
        plan: true,
      },
    });

    // Notify farmer of status progression
    try {
      let statusMsg = `Your fertilizer request status is now ${status.replace('_', ' ')}.`;
      if (status === FertilizerRequestStatus.UNDER_REVIEW) {
        statusMsg = 'An agronomist is currently diagnosing your crop photos and nutrient requirements.';
      } else if (status === FertilizerRequestStatus.COMPLETED) {
        statusMsg = 'Your fertilizer advisory has been completed. Check your fertilizer schedule.';
      }

      await NotificationService.sendNotification({
        farmerId: existing.farmerId,
        title: `Fertilizer Guide Update: ${status}`,
        body: statusMsg,
        type: 'INFO',
        deepLink: `/fertilizer-guide`,
      });
    } catch (err) {
      console.warn('[FertilizerService] Status notification error:', err);
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('fertilizer-request-updated', { id, status });
      }
    } catch {}

    return updated;
  }

  /**
   * Assign an Expert to a request
   */
  static async assignExpert(id: string, expertId: string) {
    const [request, expert] = await Promise.all([
      prisma.fertilizerRequest.findUnique({ where: { id } }),
      prisma.expert.findUnique({ where: { id: expertId } }),
    ]);

    if (!request) {
      throw new AppError(`Fertilizer request ${id} not found`, 404);
    }
    if (!expert) {
      throw new AppError(`Expert with ID ${expertId} not found`, 404);
    }

    const updated = await prisma.fertilizerRequest.update({
      where: { id },
      data: {
        expertId,
        status: FertilizerRequestStatus.EXPERT_ASSIGNED,
      },
      include: {
        farmer: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true, specialization: true } },
      },
    });

    try {
      await NotificationService.sendNotification({
        farmerId: request.farmerId,
        title: 'Expert Assigned to Your Crop',
        body: `${expert.name} (${expert.specialization}) has been assigned to evaluate your fertilizer schedule.`,
        type: 'INFO',
        deepLink: `/fertilizer-guide`,
      });
    } catch {}

    return updated;
  }

  /**
   * Create or update fertilizer plan/prescription for a request
   */
  static async createOrUpdatePlan(
    requestId: string,
    dto: CreateFertilizerPlanDto,
    expertId?: string
  ) {
    const request = await prisma.fertilizerRequest.findUnique({
      where: { id: requestId },
      include: { farmer: true },
    });

    if (!request) {
      throw new AppError(`Fertilizer request ${requestId} not found`, 404);
    }

    // Upsert the plan
    const plan = await prisma.fertilizerPlan.upsert({
      where: { fertilizerRequestId: requestId },
      create: {
        fertilizerRequestId: requestId,
        diagnosis: dto.diagnosis,
        summary: dto.summary,
        schedule: dto.schedule as any,
        organicAlternatives: dto.organicAlternatives,
        soilTreatment: dto.soilTreatment,
        precautions: dto.precautions,
        estimatedBudget: dto.estimatedBudget,
        pdfUrl: dto.pdfUrl,
      },
      update: {
        diagnosis: dto.diagnosis,
        summary: dto.summary,
        schedule: dto.schedule as any,
        organicAlternatives: dto.organicAlternatives,
        soilTreatment: dto.soilTreatment,
        precautions: dto.precautions,
        estimatedBudget: dto.estimatedBudget,
        pdfUrl: dto.pdfUrl,
      },
    });

    // Advance request status to PLAN_READY
    const updateData: any = { status: FertilizerRequestStatus.PLAN_READY };
    if (expertId && !request.expertId) {
      const expertRecord = await prisma.expert.findUnique({ where: { id: expertId } });
      if (expertRecord) {
        updateData.expertId = expertId;
      }
    }

    await prisma.fertilizerRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Send high-priority alert to farmer
    try {
      await NotificationService.sendNotification({
        farmerId: request.farmerId,
        title: '🌱 Your Custom Fertilizer Plan is Ready!',
        body: `Personalized dosage schedule prepared for ${request.cropType || 'your crop'}: ${dto.summary.slice(0, 100)}...`,
        type: 'ALERT',
        deepLink: `/fertilizer-guide`,
      });
    } catch (notifErr) {
      console.warn('[FertilizerService] Failed to notify farmer of plan readiness:', notifErr);
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('fertilizer-plan-ready', { requestId, planId: plan.id });
      }
    } catch {}

    return plan;
  }

  /**
   * Delete fertilizer request (Farmer or Admin)
   */
  static async deleteRequest(id: string, userId: string, role: string) {
    const request = await prisma.fertilizerRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new AppError(`Fertilizer request ${id} not found`, 404);
    }

    if (role === 'FARMER' && request.farmerId !== userId) {
      throw new AppError('Forbidden: You can only delete your own requests', 403);
    }

    await prisma.fertilizerRequest.delete({
      where: { id },
    });

    return { message: 'Fertilizer request deleted successfully' };
  }

  /**
   * Get Agronomic Fertilizer Guide Catalog & Standards for Common Indian Crops
   */
  static getFertilizerCatalog(cropQuery?: string): FertilizerCatalogItem[] {
    const catalog: FertilizerCatalogItem[] = [
      {
        crop: 'Cotton',
        teluguName: 'పత్తి (Patti)',
        hindiName: 'कपास (Kapas)',
        recommendedNPK: '120:60:60 kg/hectare (N:P2O5:K2O)',
        stages: [
          {
            stage: 'Basal (At Sowing)',
            timing: 'Day 0',
            recommendation: 'DAP 50 kg/acre + MOP 25 kg/acre + Zinc Sulphate 10 kg/acre.',
            dripOrFoliar: 'Soil application in furrows 5cm below seed.',
          },
          {
            stage: 'Vegetative (Squaring Stage)',
            timing: 'Day 30-35',
            recommendation: 'Urea 30 kg/acre + Magnesium Sulphate 10 kg/acre.',
            dripOrFoliar: 'Foliar spray: 19:19:19 @ 5g/L for rapid leaf expansion.',
          },
          {
            stage: 'Flowering & Boll Formation',
            timing: 'Day 60-70',
            recommendation: 'Urea 25 kg/acre + MOP 15 kg/acre.',
            dripOrFoliar: 'Foliar spray: 13:0:45 (Potassium Nitrate) @ 10g/L + Boron 20% @ 1g/L to prevent boll dropping.',
          },
          {
            stage: 'Boll Development & Maturity',
            timing: 'Day 90-100',
            recommendation: '0:0:50 (Potassium Sulphate) @ 5g/L foliar spray.',
            dripOrFoliar: 'Enhances fiber quality and boll weight.',
          },
        ],
        commonDeficiencies: [
          {
            nutrient: 'Nitrogen (N)',
            symptom: 'Pale yellowing of older leaves, stunted vegetative growth, low branching.',
            correction: 'Foliar spray of 2% Urea (20g/L) or top dress Urea 25 kg/acre.',
          },
          {
            nutrient: 'Magnesium (Mg)',
            symptom: 'Reddening / purple chlorosis of lower leaves between veins.',
            correction: 'Foliar spray of Magnesium Sulphate (MgSO4) @ 10g/L twice at 15-day intervals.',
          },
          {
            nutrient: 'Zinc (Zn)',
            symptom: 'Little leaf syndrome, interveinal chlorosis on young leaves.',
            correction: 'Chelated Zinc (Zn-EDTA 12%) @ 1.5g/L water foliar spray.',
          },
          {
            nutrient: 'Boron (B)',
            symptom: 'Flower bud shedding, malformed bolls, brittle petioles.',
            correction: 'Solubor / Borax (20% Boron) @ 1g/L foliar spray at squaring stage.',
          },
        ],
        bioFertilizers: [
          'Azotobacter 2 kg/acre mixed with 100 kg Farmyard Manure (FYM)',
          'Phosphate Solubilizing Bacteria (PSB) 2 kg/acre',
          'Neem Cake 150 kg/acre for root protection and slow nitrogen release',
        ],
      },
      {
        crop: 'Paddy / Rice',
        teluguName: 'వరి (Vari)',
        hindiName: 'धान (Dhan)',
        recommendedNPK: '100:50:50 kg/hectare',
        stages: [
          {
            stage: 'Basal (Transplanting)',
            timing: 'Day 0-3',
            recommendation: 'DAP 40 kg/acre + MOP 20 kg/acre + Zinc Sulphate 10 kg/acre.',
            dripOrFoliar: 'Incorporate into puddled soil before last leveling.',
          },
          {
            stage: 'Active Tillering Stage',
            timing: 'Day 20-25',
            recommendation: 'Urea 30 kg/acre with water level maintained at 2-3 cm.',
            dripOrFoliar: 'Neem-coated urea preferred to avoid ammonia volatilization.',
          },
          {
            stage: 'Panicle Initiation (PI)',
            timing: 'Day 45-50',
            recommendation: 'Urea 25 kg/acre + MOP 15 kg/acre.',
            dripOrFoliar: 'Foliar spray: 19:19:19 @ 5g/L.',
          },
          {
            stage: 'Booting / Grain Filling',
            timing: 'Day 65-75',
            recommendation: '0:52:34 (Monopotassium Phosphate) @ 5g/L foliar spray.',
            dripOrFoliar: 'Prevents chaffy grains and increases grain luster.',
          },
        ],
        commonDeficiencies: [
          {
            nutrient: 'Zinc (Khaira Disease)',
            symptom: 'Rusty brown spots on third leaf from top, stunted plant height.',
            correction: 'Foliar spray: Zinc Sulphate 5g + Slaked Lime 2.5g per Liter water.',
          },
          {
            nutrient: 'Iron (Fe)',
            symptom: 'Bleaching / white striping of emerging young leaves in alkaline or light soils.',
            correction: 'Foliar spray of Ferrous Sulphate 10g + Citric Acid 1g per Liter.',
          },
        ],
        bioFertilizers: [
          'Azospirillum 2 kg/acre + PSB 2 kg/acre slurry seedling root dip',
          'Blue Green Algae (BGA) / Azolla 400 kg/acre in standing water',
        ],
      },
      {
        crop: 'Chilli',
        teluguName: 'మిరప (Mirapa)',
        hindiName: 'मिर्च (Mirch)',
        recommendedNPK: '150:60:120 kg/hectare',
        stages: [
          {
            stage: 'Basal (At Bed Preparation)',
            timing: 'Day 0',
            recommendation: '10:26:26 @ 50 kg/acre + FYM 5 Tons + Neem Cake 200 kg/acre.',
            dripOrFoliar: 'Deep ridge placement under plastic mulch.',
          },
          {
            stage: 'Vegetative Growth',
            timing: 'Day 20-40',
            recommendation: '19:19:19 @ 3 kg/acre via drip every 4 days.',
            dripOrFoliar: 'Foliar spray: Micronutrient mixture (Formula 4) @ 2.5g/L.',
          },
          {
            stage: 'Flowering & Fruit Set',
            timing: 'Day 45-80',
            recommendation: '12:61:0 (MAP) @ 3 kg/acre + 13:0:45 @ 4 kg/acre alternating.',
            dripOrFoliar: 'Calcium Nitrate 5g/L + Boron 1g/L foliar to stop flower drop.',
          },
          {
            stage: 'Continuous Picking / Harvesting',
            timing: 'Day 85-150',
            recommendation: '0:0:50 @ 4 kg/acre + Urea 2 kg/acre per picking cycle.',
            dripOrFoliar: 'Maintains shine, pungency, and fruit firmness.',
          },
        ],
        commonDeficiencies: [
          {
            nutrient: 'Calcium (Ca)',
            symptom: 'Blossom end rot in fruits, cupping of young leaves downwards.',
            correction: 'Foliar spray of Calcium Nitrate (18.8% Ca, 15.5% N) @ 5g/L water.',
          },
          {
            nutrient: 'Potassium (K)',
            symptom: 'Scorching / necrosis along leaf margins, small dull fruits.',
            correction: 'Sulphate of Potash (0:0:50) @ 5g/L foliar spray.',
          },
        ],
        bioFertilizers: [
          'Mycorrhiza (VAM) 4 kg/acre at transplanting',
          'Trichoderma viride 2 kg/acre mixed with manure',
        ],
      },
      {
        crop: 'Tomato',
        teluguName: 'టమాట (Tomato)',
        hindiName: 'टमाटर (Tamatar)',
        recommendedNPK: '120:80:100 kg/hectare',
        stages: [
          {
            stage: 'Basal Dressing',
            timing: 'Day 0',
            recommendation: 'DAP 50 kg/acre + MOP 30 kg/acre + FYM 4 Tons/acre.',
            dripOrFoliar: 'Soil incorporation in raised beds.',
          },
          {
            stage: 'Vegetative Stage',
            timing: 'Day 15-30',
            recommendation: '19:19:19 @ 2.5 kg/acre via drip every 3 days.',
            dripOrFoliar: 'Humic acid 5ml/L drenching for root proliferation.',
          },
          {
            stage: 'Flowering & Fruit Development',
            timing: 'Day 35-70',
            recommendation: '13:0:45 @ 3 kg/acre + Calcium Nitrate @ 2 kg/acre via fertigation.',
            dripOrFoliar: 'Boron 20% foliar spray @ 1g/L to prevent fruit cracking.',
          },
        ],
        commonDeficiencies: [
          {
            nutrient: 'Calcium (Ca)',
            symptom: 'Black sunken spots at blossom bottom of tomatoes (Blossom End Rot).',
            correction: 'Chelated Calcium (Ca-EDTA) @ 2g/L foliar spray and uniform irrigation.',
          },
        ],
        bioFertilizers: [
          'Azospirillum + PSB @ 2 kg/acre each',
          'Pseudomonas fluorescens @ 2 kg/acre',
        ],
      },
      {
        crop: 'Groundnut / Peanut',
        teluguName: 'వేరుశనగ (Verusanaga)',
        hindiName: 'मूंगफली (Mungfali)',
        recommendedNPK: '20:40:40 kg/hectare + Gypsum 400 kg/hectare',
        stages: [
          {
            stage: 'Basal (Sowing)',
            timing: 'Day 0',
            recommendation: 'Single Super Phosphate (SSP) 100 kg/acre + MOP 25 kg/acre.',
            dripOrFoliar: 'SSP provides required Calcium & Sulphur.',
          },
          {
            stage: 'Pegging Stage',
            timing: 'Day 40-45',
            recommendation: 'Agricultural Gypsum 200 kg/acre applied around plants and earthed up.',
            dripOrFoliar: 'Crucial for pod filling, prevents pops (empty shells).',
          },
        ],
        commonDeficiencies: [
          {
            nutrient: 'Iron (Fe) Lime Chlorosis',
            symptom: 'Complete yellowing of apical foliage in calcareous black soils.',
            correction: 'Ferrous Sulphate 5g + Citric Acid 1g per Liter foliar spray.',
          },
        ],
        bioFertilizers: [
          'Rhizobium leguminosarum seed inoculation @ 200g/10kg seeds',
          'Phosphate Solubilizing Bacteria (PSB) 2 kg/acre',
        ],
      },
      {
        crop: 'Maize / Corn',
        teluguName: 'మొక్కజొన్న (Mokkajonna)',
        hindiName: 'मक्का (Makka)',
        recommendedNPK: '120:60:40 kg/hectare',
        stages: [
          {
            stage: 'Basal',
            timing: 'Day 0',
            recommendation: 'DAP 50 kg/acre + MOP 20 kg/acre + Zinc Sulphate 10 kg/acre.',
            dripOrFoliar: 'Placement 5 cm away from seeds.',
          },
          {
            stage: 'Knee-High Stage',
            timing: 'Day 25-30',
            recommendation: 'Urea 35 kg/acre top dressed followed by irrigation.',
            dripOrFoliar: 'Foliar spray: 19:19:19 @ 5g/L.',
          },
          {
            stage: 'Tasseling & Silking Stage',
            timing: 'Day 50-60',
            recommendation: 'Urea 25 kg/acre + MOP 10 kg/acre.',
            dripOrFoliar: 'Promotes cob filling and heavy seed weight.',
          },
        ],
        commonDeficiencies: [
          {
            nutrient: 'Zinc (White Bud of Maize)',
            symptom: 'Broad bleached yellowish-white bands on either side of the midrib.',
            correction: 'Chelated Zinc 1.5g/L foliar spray immediately upon symptom detection.',
          },
        ],
        bioFertilizers: ['Azotobacter 2 kg/acre', 'PSB 2 kg/acre'],
      },
    ];

    if (!cropQuery) return catalog;
    const q = cropQuery.toLowerCase().trim();
    return catalog.filter(
      (c) =>
        c.crop.toLowerCase().includes(q) ||
        (c.teluguName && c.teluguName.toLowerCase().includes(q)) ||
        (c.hindiName && c.hindiName.toLowerCase().includes(q))
    );
  }
}
