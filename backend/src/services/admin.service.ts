import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
  photoUrl?: string;
}

export interface UpdateAdminDto {
  name?: string;
  email?: string;
  password?: string;
  mobileNumber?: string;
  photoUrl?: string;
}

export class AdminService {
  /**
   * List all system administrators
   */
  static async listAdmins() {
    return await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Create a new administrative user
   */
  static async createAdmin(data: CreateAdminDto, creatorId?: string, creatorEmail?: string, ip?: string) {
    const existing = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppError('An administrator with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const admin = await prisma.admin.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        mobileNumber: data.mobileNumber?.trim() || null,
        photoUrl: data.photoUrl || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      await prisma.authAuditLog.create({
        data: {
          userId: creatorId || admin.id,
          userType: 'ADMIN',
          userName: 'Admin Staff',
          userEmail: creatorEmail || 'admin@kissanmithar.in',
          action: 'LOGIN',
          ipAddress: ip || null,
          metadata: {
            actionType: 'ADMIN_USER_CREATED',
            createdAdminId: admin.id,
            createdAdminEmail: admin.email,
            createdAdminName: admin.name,
          },
        },
      });
    } catch {
      // Non-blocking
    }

    return admin;
  }

  /**
   * Update admin user details or password
   */
  static async updateAdmin(id: string, data: UpdateAdminDto, updaterId?: string, updaterEmail?: string, ip?: string) {
    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Administrator account not found', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.mobileNumber !== undefined) updateData.mobileNumber = data.mobileNumber?.trim() || null;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl || null;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      await prisma.authAuditLog.create({
        data: {
          userId: updaterId || id,
          userType: 'ADMIN',
          userName: 'Admin Staff',
          userEmail: updaterEmail || 'admin@kissanmithar.in',
          action: 'LOGIN',
          ipAddress: ip || null,
          metadata: {
            actionType: 'ADMIN_USER_UPDATED',
            targetAdminId: id,
            targetAdminEmail: updated.email,
            passwordChanged: Boolean(data.password),
          },
        },
      });
    } catch {
      // Non-blocking
    }

    return updated;
  }

  /**
   * Delete admin account with last-super-admin safety guard
   */
  static async deleteAdmin(id: string, deleterId?: string, deleterEmail?: string, ip?: string) {
    const totalAdmins = await prisma.admin.count();
    if (totalAdmins <= 1) {
      throw new AppError('Cannot delete the last remaining administrator account. At least one Super Admin must exist.', 400);
    }

    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Administrator account not found', 404);
    }

    await prisma.admin.delete({ where: { id } });

    try {
      await prisma.authAuditLog.create({
        data: {
          userId: deleterId || id,
          userType: 'ADMIN',
          userName: 'Admin Staff',
          userEmail: deleterEmail || 'admin@kissanmithar.in',
          action: 'LOGOUT',
          ipAddress: ip || null,
          metadata: {
            actionType: 'ADMIN_USER_DELETED',
            deletedAdminId: id,
            deletedAdminEmail: existing.email,
          },
        },
      });
    } catch {
      // Non-blocking
    }

    return { success: true, message: `Administrator ${existing.name} has been deleted.` };
  }

  /**
   * Real-time operational infrastructure health and telemetry
   */
  static async getSystemHealth() {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      // Bounded probe: max 2500ms timeout so health check never hangs or starves connection pool
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB health probe timeout')), 2500)),
      ]);
      dbLatencyMs = Date.now() - startTime;
    } catch {
      dbStatus = 'unhealthy';
      dbLatencyMs = Date.now() - startTime;
    }

    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    // Count recent security events with time budget
    let recentAuditCount = 0;
    try {
      recentAuditCount = await Promise.race([
        prisma.authAuditLog.count({
          where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        }),
        new Promise<number>((_, reject) => setTimeout(() => reject(new Error('Audit count timeout')), 2500)),
      ]);
    } catch {
      recentAuditCount = 0;
    }

    return {
      status: dbStatus === 'healthy' ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        provider: 'Supabase PostgreSQL Pooler',
      },
      process: {
        uptime: uptimeFormatted,
        uptimeSeconds: uptimeSec,
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: env.NODE_ENV,
      },
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        externalMb: Math.round(mem.external / 1024 / 1024),
      },
      integrations: {
        firebaseAdmin: env.MOCK_FIREBASE_AUTH ? 'mock_mode' : 'active',
        smsProvider: env.SMS_PROVIDER,
        cloudinary: env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'unconfigured',
        weatherApi: env.WEATHER_API_KEY ? 'configured' : 'mock_fallback',
      },
      security: {
        recent24hAuditEvents: recentAuditCount,
      },
    };
  }
}
