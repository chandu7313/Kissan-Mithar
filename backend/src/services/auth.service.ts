import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getFirebaseAuth } from '../config/firebase.js';
import { SmsService } from './sms.service.js';
import { AuthUserPayload, UserRole } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

// In-memory OTP store — ONLY used in development mode
const memoryOtpStore = new Map<string, { otp: string; purpose: string; expiresAt: number; isUsed: boolean; attempts: number }>();

const isProduction = env.NODE_ENV === 'production';

// Max OTP verification attempts before lockout
const MAX_OTP_ATTEMPTS = 5;

export interface VerifyAuthDto {
  idToken?: string;
  phoneNumber?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  languageCode?: string;
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
   * Hashes a password using bcrypt (10 salt rounds)
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compares a plaintext password against a bcrypt hash.
   * Also supports legacy SHA-256 hashes for backward compatibility.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Try bcrypt first
    try {
      const bcryptMatch = await bcrypt.compare(password, hash);
      if (bcryptMatch) return true;
    } catch {
      // Not a bcrypt hash, try legacy
    }
    // Legacy SHA-256 fallback (for existing passwords before migration)
    const legacyHash = crypto.createHash('sha256').update(password + (env.JWT_SECRET || 'kissan_salt')).digest('hex');
    return legacyHash === hash;
  }

  /**
   * Generates a cryptographically secure 6-digit OTP
   */
  static generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Issues a signed JWT for the authenticated user
   */
  static generateJwt(payload: AuthUserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Records a user authentication event in database
   */
  static async recordAuthAudit(params: {
    userId: string;
    userType: UserRole;
    userName?: string;
    userEmail?: string;
    action: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH' | 'PASSWORD_RESET';
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
      logger.warn({ err }, 'Could not persist auth audit log');
    }
    return null;
  }

  /**
   * Generates and dispatches a 6-digit OTP to the user's email
   */
  static async sendEmailOtp(params: { email: string; purpose?: 'LOGIN' | 'RESET_PASSWORD'; role?: UserRole }) {
    const email = params.email.trim().toLowerCase();
    const purpose = params.purpose || 'LOGIN';
    const role = params.role || 'EXPERT';

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save in Database
    try {
      if ((prisma as any).emailOtp) {
        await (prisma as any).emailOtp.create({
          data: {
            email,
            otp,
            purpose,
            expiresAt,
            isUsed: false,
          },
        });
      }
    } catch (err) {
      logger.warn({ err }, 'DB OTP save fallback');
    }

    // In-memory fallback — DEVELOPMENT ONLY
    if (!isProduction) {
      memoryOtpStore.set(`${email}_${purpose}`, {
        otp,
        purpose,
        expiresAt: expiresAt.getTime(),
        isUsed: false,
        attempts: 0,
      });
    }

    logger.info({ email, purpose, role }, 'Email OTP generated');

    // In development, log the OTP for convenience
    if (!isProduction) {
      console.log(`\n======================================================`);
      console.log(`📧 [KISAN MITHAR] OTP FOR: ${email}`);
      console.log(`🔑 PURPOSE: ${purpose} | CODE: [ ${otp} ]`);
      console.log(`======================================================\n`);
    }

    // TODO: Send actual email via SendGrid/SES in production
    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}`,
      email,
      purpose,
      expiresInMinutes: 10,
      // TEMPORARY: Returning devOtp in production as requested by user
      devOtp: otp,
    };
  }

  /**
   * Verifies 6-digit Email OTP and issues authenticated session
   */
  static async verifyEmailOtpAndLogin(params: {
    email: string;
    otp: string;
    role?: UserRole;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const email = params.email.trim().toLowerCase();
    const otp = params.otp.trim();
    const role: UserRole = params.role || (email.includes('admin') ? 'ADMIN' : 'EXPERT');

    let isValid = false;

    // Check DB first
    try {
      if ((prisma as any).emailOtp) {
        const otpRecord = await (prisma as any).emailOtp.findFirst({
          where: {
            email,
            otp,
            purpose: 'LOGIN',
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (otpRecord) {
          isValid = true;
          await (prisma as any).emailOtp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
          });
        }
      }
    } catch (err) {
      logger.warn({ err }, 'DB OTP verification fallback');
    }

    // Fallback to memory store — DEVELOPMENT ONLY
    if (!isValid && !isProduction) {
      const memRecord = memoryOtpStore.get(`${email}_LOGIN`);
      if (memRecord) {
        memRecord.attempts = (memRecord.attempts || 0) + 1;
        if (memRecord.attempts > MAX_OTP_ATTEMPTS) {
          throw new AppError('Too many OTP attempts. Please request a new code.', 429);
        }
        if (memRecord.otp === otp && !memRecord.isUsed && Date.now() < memRecord.expiresAt) {
          isValid = true;
          memRecord.isUsed = true;
        }
      }
    }

    if (!isValid) {
      throw new AppError('Invalid or expired OTP verification code. Please request a new code.', 400);
    }

    return await this.verifyAndAuthenticate({
      email,
      role,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Logs in an Expert or Admin using Email + Password
   */
  static async loginWithPassword(params: {
    email: string;
    password: string;
    role?: UserRole;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const email = params.email.trim().toLowerCase();
    const password = params.password.trim();
    const role: UserRole = params.role || (email.includes('admin') ? 'ADMIN' : 'EXPERT');

    let expertRecord: any = null;
    let adminRecord: any = null;
    let actualRole: UserRole = role;

    try {
      // First try to find as Expert
      expertRecord = await prisma.expert.findUnique({ where: { email } });
      if (expertRecord) {
        actualRole = 'EXPERT';
      } else {
        // If not expert, try Admin
        adminRecord = await prisma.admin.findUnique({ where: { email } });
        if (adminRecord) {
          actualRole = 'ADMIN';
        }
      }
    } catch (err) {
      logger.warn({ err }, 'DB query during login');
    }

    const userHash = expertRecord?.passwordHash || adminRecord?.passwordHash;
    if (!userHash) {
      throw new AppError('Incorrect email or password. Please verify your credentials or sign in with OTP.', 401);
    }

    const isPasswordValid = await this.verifyPassword(password, userHash);

    if (!isPasswordValid) {
      throw new AppError('Incorrect email or password. Please verify your credentials or sign in with OTP.', 401);
    }

    return await this.verifyAndAuthenticate({
      email,
      name: expertRecord?.name || adminRecord?.name,
      phoneNumber: expertRecord?.phoneNumber || adminRecord?.mobileNumber,
      role: actualRole,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Resets user password after verifying 6-digit Email OTP
   */
  static async resetPasswordWithOtp(params: {
    email: string;
    otp: string;
    newPassword: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const email = params.email.trim().toLowerCase();
    const otp = params.otp.trim();
    const newPassword = params.newPassword.trim();

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long.', 400);
    }

    let isValid = false;

    // Check DB for RESET_PASSWORD OTP
    try {
      if ((prisma as any).emailOtp) {
        const otpRecord = await (prisma as any).emailOtp.findFirst({
          where: {
            email,
            otp,
            purpose: 'RESET_PASSWORD',
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (otpRecord) {
          isValid = true;
          await (prisma as any).emailOtp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
          });
        }
      }
    } catch (err) {
      logger.warn({ err }, 'DB reset OTP verification');
    }

    // Fallback to memory store — DEVELOPMENT ONLY
    if (!isValid && !isProduction) {
      const memRecord = memoryOtpStore.get(`${email}_RESET_PASSWORD`);
      if (memRecord && memRecord.otp === otp && !memRecord.isUsed && Date.now() < memRecord.expiresAt) {
        isValid = true;
        memRecord.isUsed = true;
      }
    }

    if (!isValid) {
      throw new AppError('Invalid or expired password reset OTP.', 400);
    }

    const passwordHash = await this.hashPassword(newPassword);

    // Update in Database
    let updatedUserType: UserRole = 'EXPERT';
    let userId = 'EXPERT-001';

    try {
      const expert = await prisma.expert.findUnique({ where: { email } });
      if (expert) {
        await prisma.expert.update({
          where: { email },
          data: { passwordHash },
        });
        userId = expert.id;
        updatedUserType = 'EXPERT';
      } else {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (admin) {
          await prisma.admin.update({
            where: { email },
            data: { passwordHash },
          });
          userId = admin.id;
          updatedUserType = 'ADMIN';
        }
      }
    } catch (err) {
      logger.warn({ err }, 'DB password update');
    }

    // Record PASSWORD_RESET in Audit Trail
    await this.recordAuthAudit({
      userId,
      userType: updatedUserType,
      userEmail: email,
      action: 'PASSWORD_RESET',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { timestamp: new Date().toISOString() },
    });

    return {
      success: true,
      message: 'Password has been successfully updated. You can now log in with your new password.',
    };
  }

  /**
   * Verifies Firebase ID Token or handles mock login, upserting user and recording LOGIN audit
   */
  static async verifyAndAuthenticate(dto: VerifyAuthDto) {
    let firebaseUid: string = '';
    let phoneNumber: string = dto.phoneNumber || '';
    let name: string = dto.name || 'User';
    let role: UserRole = dto.role || 'FARMER';
    const email: string = dto.email || '';

    const auth = getFirebaseAuth();

    if (auth && dto.idToken && !env.MOCK_FIREBASE_AUTH) {
      try {
        const decodedToken = await auth.verifyIdToken(dto.idToken);
        firebaseUid = decodedToken.uid;
        phoneNumber = decodedToken.phone_number || phoneNumber;
        name = decodedToken.name || name;
      } catch (err: any) {
        throw new AppError('Invalid Firebase ID Token', 401, err.message);
      }
    } else if (dto.idToken) {
      firebaseUid = `mock_firebase_${phoneNumber.replace(/[^0-9]/g, '')}`;
    }

    if (!firebaseUid) {
      firebaseUid = `custom_auth_${phoneNumber.replace(/[^0-9]/g, '')}`;
    }

    // Upsert or Retrieve User in Database
    let farmerRecord: any = null;
    let expertRecord: any = null;
    let adminRecord: any = null;

    try {
      if (role === 'FARMER') {
        if (!phoneNumber) throw new AppError('Phone number required for farmer login', 400);
        farmerRecord = await prisma.farmer.upsert({
          where: { phoneNumber },
          update: {
            name: name && name !== 'farmer' && name !== 'User' && name !== 'Farmer' ? name : undefined,
            firebaseUid: firebaseUid || undefined,
            languageCode: dto.languageCode || undefined,
          },
          create: {
            firebaseUid,
            phoneNumber,
            name: 'farmer',
            languageCode: dto.languageCode || 'en',
          },
        });
      } else {
        // For EXPERT and ADMIN, strictly query the DB
        if (role === 'EXPERT') {
          if (email) expertRecord = await prisma.expert.findUnique({ where: { email } });
          else if (phoneNumber) expertRecord = await prisma.expert.findUnique({ where: { phoneNumber } });

          if (!expertRecord && email) {
            adminRecord = await prisma.admin.findUnique({ where: { email } });
            if (adminRecord) role = 'ADMIN';
          }
        } else if (role === 'ADMIN') {
          if (email) adminRecord = await prisma.admin.findUnique({ where: { email } });

          if (!adminRecord && email) {
            expertRecord = await prisma.expert.findUnique({ where: { email } });
            if (expertRecord) role = 'EXPERT';
          }
        }

        if (!expertRecord && !adminRecord) {
          throw new AppError('Account not found. Please contact administration.', 401);
        }
      }
    } catch (dbError: any) {
      if (dbError instanceof AppError) throw dbError;
      throw new AppError('Database error during authentication', 500, dbError.message);
    }

    const userId = farmerRecord?.id || expertRecord?.id || adminRecord?.id;
    if (!userId) throw new AppError('Failed to resolve user record', 500);

    const payload: AuthUserPayload = {
      userId,
      firebaseUid,
      phoneNumber: expertRecord?.phoneNumber || farmerRecord?.phoneNumber || adminRecord?.mobileNumber || phoneNumber,
      role,
      farmerId: farmerRecord?.id || (role === 'FARMER' ? userId : undefined),
      expertId: expertRecord?.id || (role === 'EXPERT' ? userId : undefined),
      adminId: adminRecord?.id || (role === 'ADMIN' ? userId : undefined),
      name: farmerRecord?.name || expertRecord?.name || adminRecord?.name || name,
      photoUrl: farmerRecord?.photoUrl || expertRecord?.photoUrl || adminRecord?.photoUrl,
    };

    const token = this.generateJwt(payload);

    // Record LOGIN event in database audit table
    await this.recordAuthAudit({
      userId,
      userType: role,
      userName: payload.name,
      userEmail: expertRecord?.email || adminRecord?.email || email,
      action: 'LOGIN',
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata: {
        loginMethod: dto.idToken ? 'firebase_token' : 'email_auth',
        role,
      },
    });

    return {
      token,
      user: {
        ...payload,
        email: expertRecord?.email || adminRecord?.email || email,
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
   * Retrieves recent login/logout audit history
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
      logger.warn({ err }, 'Error querying auth audit logs');
    }
    return [];
  }

  /**
   * Updates user profile (like photoUrl)
   */
  static async updateProfile(params: {
    userId: string;
    role: UserRole;
    photoUrl?: string;
  }) {
    const { userId, role, photoUrl } = params;

    let updatedProfile = null;
    try {
      if (role === 'FARMER') {
        updatedProfile = await prisma.farmer.update({
          where: { id: userId },
          data: { photoUrl: photoUrl !== undefined ? photoUrl : undefined },
        });
      } else if (role === 'EXPERT') {
        updatedProfile = await prisma.expert.update({
          where: { id: userId },
          data: { photoUrl: photoUrl !== undefined ? photoUrl : undefined },
        });
      } else if (role === 'ADMIN') {
        updatedProfile = await prisma.admin.update({
          where: { id: userId },
          data: { photoUrl: photoUrl !== undefined ? photoUrl : undefined },
        });
      }
    } catch (err) {
      logger.error({ err }, 'Failed to update profile');
      throw new AppError('Failed to update profile', 500);
    }

    return {
      success: true,
      user: updatedProfile,
    };
  }

  /**
   * Sends a 6-digit OTP to a phone number for Farmer login/signup
   */
  static async sendPhoneOtp(params: { phoneNumber: string }) {
    const phoneNumber = params.phoneNumber.replace(/\D/g, '');
    const number10Digit = phoneNumber.length > 10
      ? phoneNumber.substring(phoneNumber.length - 10)
      : phoneNumber;

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB using EmailOtp table (reuse for phone OTPs)
    try {
      if ((prisma as any).emailOtp) {
        await (prisma as any).emailOtp.create({
          data: {
            email: `phone_${number10Digit}`, // Use phone as identifier
            otp,
            purpose: 'LOGIN',
            expiresAt,
            isUsed: false,
          },
        });
      }
    } catch (err) {
      logger.warn({ err }, 'DB phone OTP save fallback');
    }

    // In-memory fallback — DEVELOPMENT ONLY
    if (!isProduction) {
      memoryOtpStore.set(`phone_${number10Digit}_LOGIN`, {
        otp,
        purpose: 'LOGIN',
        expiresAt: expiresAt.getTime(),
        isUsed: false,
        attempts: 0,
      });
    }

    // Send SMS via configured provider (Fast2SMS in production)
    if (isProduction) {
      /* TEMPORARILY DISABLED: User wants to use devOtp in production for now
      const smsResult = await SmsService.sendOtp(number10Digit, otp);
      if (!smsResult.success) {
        logger.error({ phone: `***${number10Digit.slice(-4)}`, error: smsResult.message }, 'SMS delivery failed');
        // Don't expose internal failure details to client
        throw new AppError('Failed to send OTP. Please try again.', 500);
      }
      */
      console.log(`[Prod-Simulated] OTP FOR: +91 ${number10Digit} -> ${otp}`);
    } else {
      console.log(`\n======================================================`);
      console.log(`📱 [KISAN MITHAR] PHONE OTP FOR: +91 ${number10Digit}`);
      console.log(`🔑 6-DIGIT CODE: [ ${otp} ] (Valid for 10 minutes)`);
      console.log(`======================================================\n`);
    }

    return {
      success: true,
      message: `OTP sent to +91 ${number10Digit}`,
      phoneNumber: `+91 ${number10Digit}`,
      expiresInMinutes: 10,
      // TEMPORARY: Returning devOtp in production as requested by user
      devOtp: otp,
    };
  }

  /**
   * Verifies phone OTP and returns JWT token + farmer profile
   */
  static async verifyPhoneOtp(params: {
    phoneNumber: string;
    otp: string;
    name?: string;
    languageCode?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const phoneNumber = params.phoneNumber.replace(/\D/g, '');
    const number10Digit = phoneNumber.length > 10
      ? phoneNumber.substring(phoneNumber.length - 10)
      : phoneNumber;
    const otp = params.otp.trim();

    let isValid = false;

    // Check DB
    try {
      if ((prisma as any).emailOtp) {
        const otpRecord = await (prisma as any).emailOtp.findFirst({
          where: {
            email: `phone_${number10Digit}`,
            otp,
            purpose: 'LOGIN',
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (otpRecord) {
          isValid = true;
          await (prisma as any).emailOtp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
          });
        }
      }
    } catch (err) {
      logger.warn({ err }, 'DB phone OTP verify fallback');
    }

    // Memory fallback — DEVELOPMENT ONLY
    if (!isValid && !isProduction) {
      const memRecord = memoryOtpStore.get(`phone_${number10Digit}_LOGIN`);
      if (memRecord) {
        memRecord.attempts = (memRecord.attempts || 0) + 1;
        if (memRecord.attempts > MAX_OTP_ATTEMPTS) {
          throw new AppError('Too many OTP attempts. Please request a new code.', 429);
        }
        if (memRecord.otp === otp && !memRecord.isUsed && Date.now() < memRecord.expiresAt) {
          isValid = true;
          memRecord.isUsed = true;
        }
      }
    }

    if (!isValid) {
      throw new AppError('Invalid or expired OTP. Please request a new code.', 400);
    }

    // Upsert farmer and issue JWT
    const fullPhone = `+91${number10Digit}`;
    return await this.verifyAndAuthenticate({
      phoneNumber: fullPhone,
      name: params.name || 'farmer',
      languageCode: params.languageCode,
      role: 'FARMER',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }
}
