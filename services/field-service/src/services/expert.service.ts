import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import crypto from 'crypto';
import { env } from '../config/env.js';

export class ExpertService {
  /**
   * Hashes a password using sha256 + secret salt
   */
  private static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + env.JWT_SECRET).digest('hex');
  }

  /**
   * Get a list of all experts in the system
   */
  static async listExperts() {
    return await prisma.expert.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        specialization: true,
        experienceYears: true,
        rating: true,
        isAvailable: true,
        createdAt: true,
      },
    });
  }

  /**
   * Create a new expert securely
   */
  static async createExpert(data: {
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    experienceYears: number;
    password?: string;
  }) {
    // Check for existing expert by email or phone
    const existing = await prisma.expert.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phoneNumber: data.phoneNumber },
        ],
      },
    });

    if (existing) {
      if (existing.email === data.email) {
        throw new AppError('An expert with this email already exists', 400);
      }
      if (existing.phoneNumber === data.phoneNumber) {
        throw new AppError('An expert with this phone number already exists', 400);
      }
    }

    // Default password if not provided
    const password = data.password || 'Kisan@123';
    const passwordHash = this.hashPassword(password);

    const expert = await prisma.expert.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        specialization: data.specialization,
        experienceYears: data.experienceYears,
        passwordHash,
      },
    });

    return {
      id: expert.id,
      name: expert.name,
      email: expert.email,
      phoneNumber: expert.phoneNumber,
    };
  }
}
