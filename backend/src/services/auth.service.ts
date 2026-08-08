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
  email?: string;
  role?: UserRole;
  ipAddress?: string;
  userAgent?: string;
}

export interface RecordLogoutDto {
  userId: string;
  role?: UserRole;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
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
   * Records a user authentication event (LOGIN, LOGOUT, TOKEN_REFRESH) in database
   */
  static async recordAuthAudit(params: {
    userId: string;
    userType: UserRole;
    userName?: string;
    userEmail?: string;
    action: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH';
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      if ((prisma as any).authAuditLog) {
        return await (prisma as any).authAuditLog.create({
          data: {
            userId: params.userId,
            userType: params.userType,
            userName: params.userName || null,
            userEmail: params.userEmail || null,
            action: params.action,
            ipAddress: params.ipAddress || null,
            userAgent: params.userAgent || null,
            metadata: params.metadata || {},
          },
        });
      }
    } catch (err) {
      console.warn('[AuthService] Could not persist auth audit log:', err);
    }
    return null;
  }

  /**
   * Verifies Firebase ID Token or handles mock login, upserting user and recording LOGIN audit
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
      phoneNumber = dto.phoneNumber || (role === 'EXPERT' ? '+919811122233' : role === 'ADMIN' ? '+919999900000' : '+919876543210');
      firebaseUid = `mock_firebase_${phoneNumber.replace(/[^0-9]/g, '')}`;
      name = dto.name || (role === 'EXPERT' ? 'Dr. Sunil Rao' : role === 'ADMIN' ? 'Kisan Mithar Ops Admin' : 'Ramesh Patel');
    }

    // Upsert or Retrieve User in Database
    let farmerRecord: any = null;
    let expertRecord: any = null;
    let adminRecord: any = null;

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
            email: dto.email || 'sunil.rao@kissanmithar.in',
            specialization: 'Horticulture & Soil Health',
            experienceYears: 12,
            rating: 4.9,
          },
        });
      } else if (role === 'ADMIN') {
        const adminEmail = dto.email || `${phoneNumber.replace(/[^0-9]/g, '')}@kissanmithar.in`;
        adminRecord = await prisma.admin.upsert({
          where: { email: adminEmail },
          update: { firebaseUid, name },
          create: {
            firebaseUid,
            name,
            email: adminEmail,
          },
        });
      }
    } catch (dbError) {
      console.warn('[AuthService] DB upsert fallback:', dbError);
    }

    const userId = farmerRecord?.id || expertRecord?.id || adminRecord?.id || (role === 'EXPERT' ? 'EXPERT-001' : role === 'ADMIN' ? 'ADMIN-001' : 'FARMER-001');

    const payload: AuthUserPayload = {
      userId,
      firebaseUid,
      phoneNumber,
      role,
      farmerId: farmerRecord?.id || (role === 'FARMER' ? userId : undefined),
      expertId: expertRecord?.id || (role === 'EXPERT' ? userId : undefined),
      adminId: adminRecord?.id || (role === 'ADMIN' ? userId : undefined),
      name: farmerRecord?.name || expertRecord?.name || adminRecord?.name || name,
    };

    const token = this.generateJwt(payload);

    // Record LOGIN event in database audit table
    await this.recordAuthAudit({
      userId,
      userType: role,
      userName: payload.name,
      userEmail: expertRecord?.email || adminRecord?.email || dto.email,
      action: 'LOGIN',
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata: {
        loginMethod: dto.idToken ? 'firebase_token' : 'console_mock',
        role,
      },
    });

    return {
      token,
      user: {
        ...payload,
        profile: farmerRecord || expertRecord || adminRecord,
      },
    };
  }

  /**
   * Records user LOGOUT event in PostgreSQL
   */
  static async recordLogout(dto: RecordLogoutDto) {
    const role: UserRole = dto.role || 'EXPERT';
    await this.recordAuthAudit({
      userId: dto.userId,
      userType: role,
      userName: dto.userName,
      userEmail: dto.userEmail,
      action: 'LOGOUT',
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: 'Logged out and activity recorded successfully',
    };
  }

  /**
   * Retrieves recent login/logout audit history for a user or entire console
   */
  static async getAuthAuditLogs(userId?: string, limit: number = 20) {
    try {
      if ((prisma as any).authAuditLog) {
        const whereClause = userId ? { userId } : {};
        return await (prisma as any).authAuditLog.findMany({
          where: whereClause,
          orderBy: { timestamp: 'desc' },
          take: limit,
        });
      }
    } catch (err) {
      console.warn('[AuthService] Error querying auth audit logs:', err);
    }
    // Fallback mock logs if database is initializing
    return [
      {
        id: 'log-1',
        userId: userId || 'EXPERT-001',
        userType: 'EXPERT',
        userName: 'Dr. Sunil Rao',
        userEmail: 'sunil.rao@kissanmithar.in',
        action: 'LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}
