import { prisma } from '../config/db.js';
import { ConsultationMode, ConsultationStatus } from '@prisma/client';
import { NotificationService } from './notification.service.js';
import { AppError } from '../middleware/errorHandler.js';

export interface BookConsultationDto {
  farmerId: string;
  mode: ConsultationMode;
  category: string;
  scheduledAt: string | Date;
  language?: string;
  notes?: string;
  mediaUrls?: string[];
  voiceNoteUrl?: string;
}

export class ConsultationService {
  /**
   * Books an agronomy consultation session
   */
  static async bookConsultation(dto: BookConsultationDto) {
    const scheduledDate = new Date(dto.scheduledAt);

    // Auto-assign available expert if possible
    const availableExpert = await prisma.expert.findFirst({
      where: { isAvailable: true },
    });

    const consultation = await prisma.consultation.create({
      data: {
        farmerId: dto.farmerId,
        expertId: availableExpert?.id,
        mode: dto.mode,
        category: dto.category,
        scheduledAt: scheduledDate,
        language: dto.language || 'English',
        notes: dto.notes,
        mediaUrls: dto.mediaUrls as any,
        voiceNoteUrl: dto.voiceNoteUrl,
        status: 'SCHEDULED',
      },
      include: {
        expert: true,
        farmer: { select: { id: true, name: true, phoneNumber: true } },
      },
    });

    // Send confirmation push notification
    try {
      await NotificationService.sendNotification({
        farmerId: dto.farmerId,
        title: 'Consultation Confirmed',
        body: `Your ${dto.mode} session for ${dto.category} is scheduled with ${consultation.expert?.name || 'an expert'}.`,
        type: 'CONSULTATION',
        deepLink: `/consultation/detail/${consultation.id}`,
        data: { consultationId: consultation.id },
      });
    } catch (err) {
      console.warn('[ConsultationService] Notification failed:', err);
    }

    return consultation;
  }

  /**
   * Retrieves consultation history for farmer or expert
   */
  static async getHistory(filter: { farmerId?: string; expertId?: string }) {
    return await prisma.consultation.findMany({
      where: {
        ...(filter.farmerId ? { farmerId: filter.farmerId } : {}),
        ...(filter.expertId ? { expertId: filter.expertId } : {}),
      },
      include: {
        expert: true,
        farmer: { select: { id: true, name: true, phoneNumber: true, village: true, district: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Retrieves a single consultation by ID with prescriptions and media
   */
  static async getById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        expert: true,
        farmer: true,
      },
    });

    if (!consultation) {
      throw new AppError('Consultation not found', 404);
    }

    return consultation;
  }

  /**
   * Updates a consultation's status or prescription
   */
  static async update(id: string, data: {
    status?: ConsultationStatus;
    prescription?: any;
    followUpDate?: string;
    notes?: string;
  }) {
    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.prescription ? { prescription: data.prescription } : {}),
        ...(data.followUpDate ? { followUpDate: new Date(data.followUpDate) } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      },
      include: {
        expert: true,
        farmer: { select: { id: true, name: true, phoneNumber: true } },
      },
    });

    return updated;
  }
}
