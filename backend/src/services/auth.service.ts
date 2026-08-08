import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { getFirebaseAuth } from '../config/firebase.js';
import { AuthUserPayload, UserRole } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface VerifyAuthDto {
  idToken?: string;
  phoneNumber?: string;
  name?: string;
  role?: UserRole;
}

export class AuthService {
  /**
   * Issues a signed JWT for the authenticated user
   */
  static generateJwt(payload: AuthUserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Verifies Firebase ID Token or handles mock login, upserting the user and issuing a JWT
   */
  static async verifyAndAuthenticate(dto: VerifyAuthDto) {
    let firebaseUid: string;
    let phoneNumber: string;
    let name: string = dto.name || 'Farmer';
    const role: UserRole = dto.role || 'FARMER';

    const auth = getFirebaseAuth();

    if (auth && dto.idToken && !env.MOCK_FIREBASE_AUTH) {
      try {
        const decodedToken = await auth.verifyIdToken(dto.idToken);
        firebaseUid = decodedToken.uid;
        phoneNumber = decodedToken.phone_number || dto.phoneNumber || '+919876543210';
        name = decodedToken.name || dto.name || 'Farmer';
      } catch (err: any) {
        throw new AppError('Invalid Firebase ID Token', 401, err.message);
      }
    } else {
      // Mock / Development Authentication Flow
      phoneNumber = dto.phoneNumber || '+919876543210';
      firebaseUid = `mock_firebase_${phoneNumber.replace(/[^0-9]/g, '')}`;
      name = dto.name || (role === 'EXPERT' ? 'Dr. Sunil Rao' : 'Ramesh Patel');
    }

    // Upsert or Retrieve User in Database
    let farmerRecord = null;
    let expertRecord = null;
    let adminRecord = null;

    try {
      if (role === 'FARMER') {
        farmerRecord = await prisma.farmer.upsert({
          where: { phoneNumber },
          update: {
            name: name || undefined,
            firebaseUid,
          },
          create: {
            firebaseUid,
            phoneNumber,
            name,
            village: 'Khed',
            district: 'Pune',
            state: 'Maharashtra',
            landAcres: 2.5,
            primaryCrop: 'Mango & Guava',
            languageCode: 'en',
          },
        });
      } else if (role === 'EXPERT') {
        expertRecord = await prisma.expert.upsert({
          where: { phoneNumber },
          update: { name, firebaseUid },
          create: {
            firebaseUid,
            phoneNumber,
            name,
            specialization: 'Horticulture & Soil Health',
            experienceYears: 12,
            rating: 4.9,
          },
        });
      } else if (role === 'ADMIN') {
        adminRecord = await prisma.admin.upsert({
          where: { email: `${phoneNumber}@kissanmithar.in` },
          update: { firebaseUid },
          create: {
            firebaseUid,
            name,
            email: `${phoneNumber}@kissanmithar.in`,
          },
        });
      }
    } catch (dbError) {
      console.warn('[AuthService] DB upsert fallback:', dbError);
    }

    const payload: AuthUserPayload = {
      userId: farmerRecord?.id || expertRecord?.id || adminRecord?.id || `USER-${Date.now()}`,
      firebaseUid,
      phoneNumber,
      role,
      farmerId: farmerRecord?.id || (role === 'FARMER' ? 'FARMER-9821' : undefined),
      expertId: expertRecord?.id || (role === 'EXPERT' ? 'EXPERT-001' : undefined),
      adminId: adminRecord?.id || (role === 'ADMIN' ? 'ADMIN-001' : undefined),
      name: farmerRecord?.name || expertRecord?.name || adminRecord?.name || name,
    };

    const token = this.generateJwt(payload);

    return {
      token,
      user: {
        ...payload,
        profile: farmerRecord || expertRecord || adminRecord,
      },
    };
  }
}
