import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export interface UpdateFarmerDto {
  name?: string;
  photoUrl?: string;
  village?: string;
  district?: string;
  state?: string;
  landAcres?: number;
  primaryCrop?: string;
  languageCode?: string;
}

export class FarmerService {
  /**
   * Retrieves profile for the authenticated farmer
   */
  static async getProfile(farmerId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        devices: true,
        _count: {
          select: {
            orchardRequests: true,
            consultations: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    return farmer;
  }

  /**
   * Lists all farmers (Admin/Expert view)
   */
  static async listAll(filter?: { state?: string; limit?: number }) {
    return await prisma.farmer.findMany({
      where: {
        ...(filter?.state ? { state: { contains: filter.state, mode: 'insensitive' as any } } : {}),
      },
      include: {
        _count: {
          select: {
            orchardRequests: true,
            consultations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 100,
    });
  }

  /**
   * Updates profile fields for the farmer
   */
  static async updateProfile(farmerId: string, data: UpdateFarmerDto) {
    return await prisma.farmer.update({
      where: { id: farmerId },
      data: {
        name: data.name,
        photoUrl: data.photoUrl,
        village: data.village,
        district: data.district,
        state: data.state,
        landAcres: data.landAcres,
        primaryCrop: data.primaryCrop,
        languageCode: data.languageCode,
      },
    });
  }
}
