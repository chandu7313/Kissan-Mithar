import { prisma } from '../config/db.js';

export class CropAdvisoryService {
  /**
   * Fetches crop advisories with optional filters
   */
  static async getAdvisories(filter: {
    crop?: string;
    alertLevel?: string;
    season?: string;
    limit?: number;
  }) {
    return await prisma.cropAdvisory.findMany({
      where: {
        ...(filter.crop ? { crop: { contains: filter.crop, mode: 'insensitive' as any } } : {}),
        ...(filter.alertLevel ? { alertLevel: filter.alertLevel } : {}),
        ...(filter.season ? { season: filter.season } : {}),
      },
      include: {
        expert: {
          select: { id: true, name: true, specialization: true, photoUrl: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: filter.limit || 20,
    });
  }

  /**
   * Create a new crop advisory (experts/admin only)
   */
  static async createAdvisory(data: {
    expertId?: string;
    crop: string;
    title: string;
    description: string;
    alertLevel?: string;
    season?: string;
  }) {
    return await prisma.cropAdvisory.create({
      data: {
        expertId: data.expertId,
        crop: data.crop,
        title: data.title,
        description: data.description,
        alertLevel: data.alertLevel || 'NORMAL',
        season: data.season || 'ALL_SEASON',
      },
      include: {
        expert: {
          select: { id: true, name: true, specialization: true },
        },
      },
    });
  }
}
