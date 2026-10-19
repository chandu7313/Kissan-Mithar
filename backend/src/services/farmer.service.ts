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

export interface ListFarmersFilter {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
  state?: string;
  primaryCrop?: string;
  sortBy?: 'createdAt' | 'name' | 'landAcres';
  sortOrder?: 'asc' | 'desc';
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
            fertilizerRequests: true,
            diseaseRequests: true,
            labourRequests: true,
            agriProductListings: true,
            agriProductRequests: true,
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
   * Comprehensive paginated farmer directory with search & filters (Admin/Expert view)
   */
  static async listAll(filter?: ListFarmersFilter) {
    const page = Math.max(1, Number(filter?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter?.state) {
      where.state = { contains: filter.state, mode: 'insensitive' };
    }

    if (filter?.district) {
      where.district = { contains: filter.district, mode: 'insensitive' };
    }

    if (filter?.primaryCrop) {
      where.primaryCrop = { contains: filter.primaryCrop, mode: 'insensitive' };
    }

    if (filter?.search) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q } },
        { village: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
        { primaryCrop: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = filter?.sortBy || 'createdAt';
    const sortDirection = filter?.sortOrder || 'desc';

    const [total, farmers] = await Promise.all([
      prisma.farmer.count({ where }),
      prisma.farmer.findMany({
        where,
        include: {
          devices: {
            select: { platform: true, lastActive: true },
            take: 1,
            orderBy: { lastActive: 'desc' },
          },
          _count: {
            select: {
              orchardRequests: true,
              consultations: true,
              fertilizerRequests: true,
              diseaseRequests: true,
              labourRequests: true,
              agriProductListings: true,
              agriProductRequests: true,
            },
          },
        },
        orderBy: { [sortField]: sortDirection },
        skip,
        take: limit,
      }),
    ]);

    return {
      farmers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Complete 360-degree Farmer Dossier for Admin view
   */
  static async getFarmerDossier(farmerId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        devices: true,
        orchardRequests: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            landDetails: true,
            expert: { select: { name: true, specialization: true } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        fertilizerRequests: {
          select: {
            id: true,
            status: true,
            cropType: true,
            landAcres: true,
            soilType: true,
            submittedAt: true,
            expert: { select: { name: true } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        diseaseRequests: {
          select: {
            id: true,
            status: true,
            cropType: true,
            affectedPart: true,
            submittedAt: true,
            treatment: { select: { diseaseName: true, severity: true } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        labourRequests: {
          select: {
            id: true,
            status: true,
            taskType: true,
            labourersRequired: true,
            dailyWage: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        agriProductListings: {
          select: {
            id: true,
            productName: true,
            variety: true,
            price: true,
            priceUnit: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        agriProductRequests: {
          select: {
            id: true,
            productName: true,
            requiredQuantity: true,
            quantityUnit: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        consultations: {
          select: {
            id: true,
            category: true,
            mode: true,
            status: true,
            scheduledAt: true,
            expert: { select: { name: true } },
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            orchardRequests: true,
            fertilizerRequests: true,
            diseaseRequests: true,
            labourRequests: true,
            agriProductListings: true,
            agriProductRequests: true,
            consultations: true,
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
   * Updates profile fields for the farmer
   */
  static async updateProfile(farmerId: string, data: UpdateFarmerDto) {
    return await prisma.farmer.update({
      where: { id: farmerId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.village !== undefined ? { village: data.village } : {}),
        ...(data.district !== undefined ? { district: data.district } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.landAcres !== undefined ? { landAcres: data.landAcres } : {}),
        ...(data.primaryCrop !== undefined ? { primaryCrop: data.primaryCrop } : {}),
        ...(data.languageCode !== undefined ? { languageCode: data.languageCode } : {}),
      },
    });
  }

  /**
   * Administrative update of farmer profile with audit logging
   */
  static async updateFarmerByAdmin(
    farmerId: string,
    data: UpdateFarmerDto,
    adminId?: string,
    adminEmail?: string,
    ipAddress?: string
  ) {
    const existing = await prisma.farmer.findUnique({
      where: { id: farmerId },
    });

    if (!existing) {
      throw new AppError('Farmer not found', 404);
    }

    const updated = await prisma.farmer.update({
      where: { id: farmerId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.village !== undefined ? { village: data.village } : {}),
        ...(data.district !== undefined ? { district: data.district } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.landAcres !== undefined ? { landAcres: data.landAcres } : {}),
        ...(data.primaryCrop !== undefined ? { primaryCrop: data.primaryCrop } : {}),
        ...(data.languageCode !== undefined ? { languageCode: data.languageCode } : {}),
      },
    });

    // Record administrative update in AuthAuditLog
    try {
      await prisma.authAuditLog.create({
        data: {
          userId: adminId || 'admin',
          userType: 'ADMIN',
          userName: 'Admin Staff',
          userEmail: adminEmail || 'admin@kissanmithar.in',
          action: 'LOGIN', // Reuse existing enum with metadata
          ipAddress: ipAddress || null,
          metadata: {
            actionType: 'FARMER_PROFILE_UPDATED',
            farmerId,
            farmerName: existing.name,
            farmerPhone: existing.phoneNumber,
            changes: data as any,
          },
        },
      });
    } catch {
      // Non-blocking audit failure
    }

    return updated;
  }
}
