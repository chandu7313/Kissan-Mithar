import { prisma } from '../config/db.js';
import { DiseaseRequestStatus } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIO } from '../config/socket.js';
import { UploadService } from './upload.service.js';

export interface CreateDiseaseRequestDto {
  farmerId: string;
  cropType?: string;
  cropAge?: string;
  affectedPart?: string;
  symptomDescription?: string;
  voiceNoteUrl?: string;
  voiceText?: string;
  photos: string[] | Record<string, any>;
  gps?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
  };
  spreadRate?: string;
  previousPesticides?: string;
  notes?: string;
}

export interface CreateDiseaseTreatmentDto {
  diseaseName: string;
  causalOrganism?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnosisSummary: string;
  immediateAction: string;
  chemicalTreatment: Array<{
    chemicalName: string;
    commercialBrand: string;
    dosage: string;
    applicationMethod: string;
    waitingPeriodDays?: number;
  }>;
  organicTreatment?: string;
  preventativeMeasures?: string;
  followUpDays?: number;
  estimatedCost?: number;
  pdfUrl?: string;
}

export interface DiseaseCatalogItem {
  crop: string;
  teluguName?: string;
  hindiName?: string;
  commonDiseases: Array<{
    name: string;
    teluguName?: string;
    causalType: 'Fungus' | 'Bacteria' | 'Virus' | 'Pest';
    symptoms: string;
    immediateAction: string;
    chemicalControl: string;
    organicControl: string;
  }>;
}

export class DiseaseService {
  /**
   * Submit a new Disease Help request from farmer
   */
  static async createRequest(dto: CreateDiseaseRequestDto) {
    // 1. Verify farmer exists
    const farmer = await prisma.farmer.findUnique({
      where: { id: dto.farmerId },
      select: { id: true, name: true, phoneNumber: true, village: true },
    });

    if (!farmer) {
      throw new AppError('Farmer profile not found for the provided ID', 404);
    }

    const photosData = Array.isArray(dto.photos) ? dto.photos : (dto.photos as any);

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

    const symptomText =
      dto.symptomDescription ||
      dto.voiceText ||
      (voiceUrl ? 'Voice note recording attached by farmer' : 'Disease symptoms submitted by farmer');

    // 2. Insert into PostgreSQL
    const request = await prisma.diseaseRequest.create({
      data: {
        farmerId: dto.farmerId,
        cropType: dto.cropType || 'Crop',
        cropAge: dto.cropAge,
        affectedPart: dto.affectedPart || 'Leaves',
        symptomDescription: symptomText,
        voiceNoteUrl: voiceUrl,
        voiceText: dto.voiceText || (voiceUrl ? 'Voice note attached' : null),
        photos: photosData,
        gps: dto.gps as any,
        spreadRate: dto.spreadRate,
        previousPesticides: dto.previousPesticides,
        notes: dto.notes,
        status: DiseaseRequestStatus.SUBMITTED,
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

    // 3. Dispatch confirmation notification to farmer
    try {
      await NotificationService.sendNotification({
        farmerId: dto.farmerId,
        title: 'Disease Inquiry Submitted Successfully',
        body: `Photos of your ${request.cropType} have been received. Plant pathologists are examining the symptoms.`,
        type: 'SUCCESS',
        deepLink: '/disease-help',
      });
    } catch (err) {
      console.warn('[DiseaseService] Notification error:', err);
    }

    // 4. Real-time alert to expert portal via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.emit('new-disease-request', {
          requestId: request.id,
          farmerName: farmer.name,
          cropType: request.cropType,
          symptoms: request.symptomDescription,
          submittedAt: request.submittedAt,
        });
      }
    } catch {}

    return request;
  }

  /**
   * List disease requests with filters & pagination
   */
  static async getRequests(filters: {
    farmerId?: string;
    expertId?: string;
    status?: DiseaseRequestStatus;
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
      prisma.diseaseRequest.count({ where }),
      prisma.diseaseRequest.findMany({
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
          treatment: true,
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
   * Get single disease request by ID
   */
  static async getRequestById(id: string) {
    const request = await prisma.diseaseRequest.findUnique({
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
        treatment: true,
      },
    });

    if (!request) {
      throw new AppError(`Disease request with ID ${id} not found`, 404);
    }

    return request;
  }

  /**
   * Update review status of a disease request
   */
  static async updateStatus(id: string, status: DiseaseRequestStatus, expertId?: string) {
    const existing = await prisma.diseaseRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(`Disease request ${id} not found`, 404);
    }

    const updateData: any = { status };
    if (expertId && !existing.expertId) {
      const expertRecord = await prisma.expert.findUnique({ where: { id: expertId } });
      if (expertRecord) {
        updateData.expertId = expertId;
      }
    }

    const updated = await prisma.diseaseRequest.update({
      where: { id },
      data: updateData,
      include: {
        farmer: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true } },
        treatment: true,
      },
    });

    // Notify farmer
    try {
      let statusMsg = `Your disease inquiry status is now ${status.replace('_', ' ')}.`;
      if (status === DiseaseRequestStatus.UNDER_REVIEW) {
        statusMsg = 'Our agricultural scientist is analyzing the leaf symptoms under magnification.';
      } else if (status === DiseaseRequestStatus.COMPLETED) {
        statusMsg = 'Your disease diagnosis & treatment instructions are finalized.';
      }

      await NotificationService.sendNotification({
        farmerId: existing.farmerId,
        title: `Disease Help Update: ${status}`,
        body: statusMsg,
        type: 'INFO',
        deepLink: '/disease-help',
      });
    } catch {}

    try {
      const io = getIO();
      if (io) {
        io.emit('disease-request-updated', { id, status });
      }
    } catch {}

    return updated;
  }

  /**
   * Assign an Expert to the disease request
   */
  static async assignExpert(id: string, expertId: string) {
    const [request, expert] = await Promise.all([
      prisma.diseaseRequest.findUnique({ where: { id } }),
      prisma.expert.findUnique({ where: { id: expertId } }),
    ]);

    if (!request) {
      throw new AppError(`Disease request ${id} not found`, 404);
    }
    if (!expert) {
      throw new AppError(`Expert with ID ${expertId} not found`, 404);
    }

    const updated = await prisma.diseaseRequest.update({
      where: { id },
      data: {
        expertId,
        status: DiseaseRequestStatus.EXPERT_ASSIGNED,
      },
      include: {
        farmer: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true, specialization: true } },
      },
    });

    try {
      await NotificationService.sendNotification({
        farmerId: request.farmerId,
        title: 'Crop Pathologist Assigned',
        body: `${expert.name} (${expert.specialization}) is diagnosing your crop disease issue.`,
        type: 'INFO',
        deepLink: '/disease-help',
      });
    } catch {}

    return updated;
  }

  /**
   * Formulate and deliver Disease Treatment Plan
   */
  static async createOrUpdateTreatment(
    requestId: string,
    dto: CreateDiseaseTreatmentDto,
    expertId?: string
  ) {
    const request = await prisma.diseaseRequest.findUnique({
      where: { id: requestId },
      include: { farmer: true },
    });

    if (!request) {
      throw new AppError(`Disease request ${requestId} not found`, 404);
    }

    // Upsert the treatment plan
    const treatment = await prisma.diseaseTreatmentPlan.upsert({
      where: { diseaseRequestId: requestId },
      create: {
        diseaseRequestId: requestId,
        diseaseName: dto.diseaseName,
        causalOrganism: dto.causalOrganism,
        severity: dto.severity || 'MEDIUM',
        diagnosisSummary: dto.diagnosisSummary,
        immediateAction: dto.immediateAction,
        chemicalTreatment: dto.chemicalTreatment as any,
        organicTreatment: dto.organicTreatment,
        preventativeMeasures: dto.preventativeMeasures,
        followUpDays: dto.followUpDays ?? 7,
        estimatedCost: dto.estimatedCost,
        pdfUrl: dto.pdfUrl,
      },
      update: {
        diseaseName: dto.diseaseName,
        causalOrganism: dto.causalOrganism,
        severity: dto.severity || 'MEDIUM',
        diagnosisSummary: dto.diagnosisSummary,
        immediateAction: dto.immediateAction,
        chemicalTreatment: dto.chemicalTreatment as any,
        organicTreatment: dto.organicTreatment,
        preventativeMeasures: dto.preventativeMeasures,
        followUpDays: dto.followUpDays ?? 7,
        estimatedCost: dto.estimatedCost,
        pdfUrl: dto.pdfUrl,
      },
    });

    // Advance status to DIAGNOSED
    const updateData: any = { status: DiseaseRequestStatus.DIAGNOSED };
    if (expertId && !request.expertId) {
      const expertRecord = await prisma.expert.findUnique({ where: { id: expertId } });
      if (expertRecord) {
        updateData.expertId = expertId;
      }
    }

    await prisma.diseaseRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Send high-priority treatment alert to farmer
    try {
      await NotificationService.sendNotification({
        farmerId: request.farmerId,
        title: `🚨 Disease Diagnosed: ${dto.diseaseName}`,
        body: `Immediate action: ${dto.immediateAction.slice(0, 90)}... Tap to view recommended chemical & organic spray dosages.`,
        type: 'ALERT',
        deepLink: '/disease-help',
      });
    } catch (notifErr) {
      console.warn('[DiseaseService] Failed to notify farmer of diagnosis:', notifErr);
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('disease-diagnosed', { requestId, treatmentId: treatment.id });
      }
    } catch {}

    return treatment;
  }

  /**
   * Delete disease request (Farmer or Admin)
   */
  static async deleteRequest(id: string, userId: string, role: string) {
    const request = await prisma.diseaseRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new AppError(`Disease request ${id} not found`, 404);
    }

    if (role === 'FARMER' && request.farmerId !== userId) {
      throw new AppError('Forbidden: You can only delete your own inquiries', 403);
    }

    await prisma.diseaseRequest.delete({
      where: { id },
    });

    return { message: 'Disease inquiry deleted successfully' };
  }

  /**
   * Crop Disease Diagnostic Knowledge Catalog
   */
  static getDiseaseCatalog(cropQuery?: string): DiseaseCatalogItem[] {
    const catalog: DiseaseCatalogItem[] = [
      {
        crop: 'Chilli',
        teluguName: 'మిరప (Mirapa)',
        hindiName: 'मिर्च (Mirch)',
        commonDiseases: [
          {
            name: 'Die-back & Anthracnose (Fruit Rot)',
            teluguName: 'కొమ్మ ఎండు తెగులు / కాయ కుళ్ళు',
            causalType: 'Fungus',
            symptoms: 'Necrosis of tender twigs from top to bottom, circular sunken black spots on ripe fruits.',
            immediateAction: 'Clip and burn dried twigs; spray within 24 hours of cloudy weather.',
            chemicalControl: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L.',
            organicControl: 'Foliar spray with Trichoderma viride @ 5g/L + Neem oil 10,000 ppm @ 3 ml/L.',
          },
          {
            name: 'Chilli Leaf Curl & Murda Complex (Thrips & Mites)',
            teluguName: 'బొబ్బర తెగులు / ముడత',
            causalType: 'Pest',
            symptoms: 'Upward curling of leaves (Thrips attack), downward boat-shaped curling with elongation (Mites attack).',
            immediateAction: 'Install blue & yellow sticky traps @ 30 per acre; avoid excess nitrogen.',
            chemicalControl: 'Fipronil 5% SC @ 2 ml/L (for upward curl) or Spiromesifen 22.9% SC @ 1 ml/L (for downward curl).',
            organicControl: 'Sour buttermilk 500ml + Asafoetida (Hing) 10g in 15L water spray.',
          },
          {
            name: 'Powdery Mildew',
            teluguName: 'బూడిద తెగులు',
            causalType: 'Fungus',
            symptoms: 'White powdery fungal growth on the lower surface of leaves with yellow chlorotic spots on top.',
            immediateAction: 'Spray early in morning before dew evaporates.',
            chemicalControl: 'Wettable Sulphur 80% WP @ 3 g/L or Hexaconazole 5% EC @ 1 ml/L.',
            organicControl: 'Baking soda (Sodium bicarbonate) 5g/L + Neem oil 2ml/L.',
          },
        ],
      },
      {
        crop: 'Cotton',
        teluguName: 'పత్తి (Patti)',
        hindiName: 'कपास (Kapas)',
        commonDiseases: [
          {
            name: 'Bacterial Blight (Angular Leaf Spot / Black Arm)',
            teluguName: 'బ్యాక్టీరియా ఆకుమచ్చ తెగులు',
            causalType: 'Bacteria',
            symptoms: 'Water-soaked angular leaf spots bounded by veinlets, dark lesions on branches causing black arm.',
            immediateAction: 'Do not irrigate until soil surface dries; avoid sprinkler irrigation.',
            chemicalControl: 'Copper Oxychloride (COC 50% WP) @ 3 g/L + Streptocycline @ 1 g per 10 Liters water.',
            organicControl: 'Pseudomonas fluorescens @ 5g/L foliar spray.',
          },
          {
            name: 'Grey Mildew (Dahiya Disease)',
            teluguName: 'దహియా తెగులు',
            causalType: 'Fungus',
            symptoms: 'Pale white angular powdery patches on lower leaf surface resembling wheat flour dust.',
            immediateAction: 'Improve field aeration and remove lower senescent leaves.',
            chemicalControl: 'Kresoxim-methyl 44.3% SC @ 1 ml/L or Carbendazim 50% WP @ 1 g/L.',
            organicControl: 'Cow urine 10% solution (1L in 10L water) fermented for 3 days.',
          },
          {
            name: 'Fusarium Wilt',
            teluguName: 'ఎండు తెగులు',
            causalType: 'Fungus',
            symptoms: 'Yellowing of leaf margins, vascular browning when stem is split vertically, total wilting.',
            immediateAction: 'Drench root zone of surrounding plants to arrest radial soil spread.',
            chemicalControl: 'Soil drenching with Carbendazim 12% + Mancozeb 63% WP @ 2.5 g/L.',
            organicControl: 'Trichoderma harzianum @ 2 kg/acre enriched in 200 kg FYM applied to root zone.',
          },
        ],
      },
      {
        crop: 'Paddy / Rice',
        teluguName: 'వరి (Vari)',
        hindiName: 'धान (Dhan)',
        commonDiseases: [
          {
            name: 'Blast Disease (Magnaporthe oryzae)',
            teluguName: 'అగ్గి తెగులు',
            causalType: 'Fungus',
            symptoms: 'Spindle-shaped eye spots with ash-colored centers and brownish borders; neck rot causes broken panicles.',
            immediateAction: 'Suspend top dressing of Urea; maintain shallow standing water.',
            chemicalControl: 'Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L.',
            organicControl: 'Spray 5% Neem seed kernel extract (NSKE) or Pseudomonas fluorescens @ 5 g/L.',
          },
          {
            name: 'Bacterial Leaf Blight (BLB)',
            teluguName: 'బ్యాక్టీరియల్ ఆకు ఎండు తెగులు',
            causalType: 'Bacteria',
            symptoms: 'Wavy margins of yellowish lesions starting from leaf tips moving downward; milky bacterial ooze.',
            immediateAction: 'Drain field for 48 hours; withhold nitrogenous fertilizer completely.',
            chemicalControl: 'Plantomycin 1g + Copper Oxychloride 2.5g per Liter water.',
            organicControl: 'Fresh cow dung slurry supernatant (20 kg cow dung in 200L water strained) spray.',
          },
          {
            name: 'Sheath Blight',
            teluguName: 'వరి కాండం కుళ్ళు తెగులు',
            causalType: 'Fungus',
            symptoms: 'Oval greenish-grey water-soaked spots on leaf sheaths near water level spreading upwards.',
            immediateAction: 'Clean weeds on bunds; avoid high plant density.',
            chemicalControl: 'Hexaconazole 5% SC @ 2 ml/L or Validamycin 3% L @ 2 ml/L.',
            organicControl: 'Soil application of Trichoderma viride enriched farmyard manure.',
          },
        ],
      },
      {
        crop: 'Tomato',
        teluguName: 'టమాట (Tomato)',
        hindiName: 'टमाटर (Tamatar)',
        commonDiseases: [
          {
            name: 'Early Blight (Alternaria solani)',
            teluguName: 'ముందస్తు ఆకుమచ్చ తెగులు',
            causalType: 'Fungus',
            symptoms: 'Target-board circular brown spots with concentric rings on older foliage, stem cankers.',
            immediateAction: 'Remove diseased lower leaves touching soil.',
            chemicalControl: 'Chlorothalonil 75% WP @ 2 g/L or Azoxystrobin 23% SC @ 1 ml/L.',
            organicControl: 'Foliar spray with Bacillus subtilis @ 5g/L.',
          },
          {
            name: 'Late Blight (Phytophthora infestans)',
            teluguName: 'లేట్ బ్లైట్ / ఆకు మాగు తెగులు',
            causalType: 'Fungus',
            symptoms: 'Rapidly spreading water-soaked brown lesions on leaves with white fuzzy mold on underside during cool wet weather.',
            immediateAction: 'Spray immediately before rain/foggy weather; prune dense foliage.',
            chemicalControl: 'Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L or Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L.',
            organicControl: 'Copper hydroxide 53.8% DF @ 2 g/L preventative spray.',
          },
        ],
      },
      {
        crop: 'Groundnut / Peanut',
        teluguName: 'వేరుశనగ (Verusanaga)',
        hindiName: 'मूंगफली (Mungfali)',
        commonDiseases: [
          {
            name: 'Tikka Disease (Early & Late Leaf Spot)',
            teluguName: 'టిక్కా ఆకుమచ్చ తెగులు',
            causalType: 'Fungus',
            symptoms: 'Circular brown to dark black lesions surrounded by prominent yellow halo causing severe defoliation.',
            immediateAction: 'Spray upon seeing first spots; avoid drought stress.',
            chemicalControl: 'Tebuconazole 25.9% EC @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L.',
            organicControl: 'Panchagavya 3% (30ml/L) foliar spray at 15-day intervals.',
          },
        ],
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
