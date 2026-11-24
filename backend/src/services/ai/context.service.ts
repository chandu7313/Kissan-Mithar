import { prisma } from '../../config/db.js';
import { FarmerContext } from './types.js';

export class ContextService {
  /**
   * Hydrates farmer context from database profile & persistent memory
   */
  static async getFarmerContext(farmerId?: string): Promise<FarmerContext> {
    if (!farmerId) {
      return {
        farmerId: 'guest',
        name: 'Farmer',
        phoneNumber: '',
        languageCode: 'en',
      };
    }

    try {
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
        include: { memory: true },
      });

      if (!farmer) {
        return {
          farmerId,
          name: 'Farmer',
          phoneNumber: '',
          languageCode: 'en',
        };
      }

      return {
        farmerId: farmer.id,
        name: farmer.name,
        phoneNumber: farmer.phoneNumber,
        languageCode: farmer.languageCode || 'en',
        village: farmer.village || undefined,
        district: farmer.district || undefined,
        state: farmer.state || undefined,
        landAcres: farmer.landAcres || undefined,
        primaryCrop: farmer.primaryCrop || undefined,
        soilType: farmer.memory?.soilType || undefined,
        activeCrops: (farmer.memory?.activeCrops as any[]) || undefined,
        memoryFacts: (farmer.memory?.facts as Record<string, any>) || undefined,
        hasConsent: farmer.memory?.consentGiven || false,
      };
    } catch {
      // Offline fallback
      return {
        farmerId,
        name: 'Farmer',
        phoneNumber: '',
        languageCode: 'en',
      };
    }
  }

  /**
   * Saves or updates persistent farmer memory facts (if consent is active)
   */
  static async updateFarmerMemory(
    farmerId: string,
    updates: {
      soilType?: string;
      landAcres?: number;
      primaryCrop?: string;
      facts?: Record<string, any>;
      consentGiven?: boolean;
    }
  ) {
    if (!farmerId || farmerId === 'guest') return;

    try {
      const existing = await prisma.farmerMemory.findUnique({ where: { farmerId } });

      const mergedFacts = {
        ...(existing?.facts as Record<string, any> || {}),
        ...(updates.facts || {}),
      };

      await prisma.farmerMemory.upsert({
        where: { farmerId },
        create: {
          farmerId,
          soilType: updates.soilType,
          totalLandAcres: updates.landAcres,
          facts: mergedFacts,
          consentGiven: updates.consentGiven ?? false,
          consentTimestamp: updates.consentGiven ? new Date() : undefined,
        },
        update: {
          ...(updates.soilType ? { soilType: updates.soilType } : {}),
          ...(updates.landAcres ? { totalLandAcres: updates.landAcres } : {}),
          facts: mergedFacts,
          ...(updates.consentGiven !== undefined
            ? {
                consentGiven: updates.consentGiven,
                consentTimestamp: updates.consentGiven ? new Date() : undefined,
              }
            : {}),
        },
      });

      // Update basic profile if relevant
      if (updates.landAcres || updates.primaryCrop) {
        await prisma.farmer.update({
          where: { id: farmerId },
          data: {
            ...(updates.landAcres ? { landAcres: updates.landAcres } : {}),
            ...(updates.primaryCrop ? { primaryCrop: updates.primaryCrop } : {}),
          },
        });
      }
    } catch (err) {
      console.warn('[ContextService] Failed to update memory:', err);
    }
  }
}
