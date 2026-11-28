import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import { ServiceHttpClient } from '../gateway/serviceClient.js';

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

const identityClient = new ServiceHttpClient(
  'identity-service',
  () => env.IDENTITY_SERVICE_URL,
  'api-gateway'
);

async function recordAdminAudit(payload: {
  userId: string;
  userEmail: string;
  action: 'LOGIN' | 'LOGOUT';
  ipAddress?: string | null;
  metadata: Record<string, any>;
}) {
  try {
    if (identityClient.isConfigured()) {
      await identityClient.request({
        method: 'POST',
        path: '/internal/audit-logs',
        body: {
          userId: payload.userId,
          userType: 'ADMIN',
          userName: 'Admin Staff',
          userEmail: payload.userEmail,
          action: payload.action,
          ipAddress: payload.ipAddress || null,
          metadata: payload.metadata,
        },
        timeoutMs: 3000,
      });
      return;
    }

    await prisma.authAuditLog.create({
      data: {
        userId: payload.userId,
        userType: 'ADMIN',
        userName: 'Admin Staff',
        userEmail: payload.userEmail,
        action: payload.action,
        ipAddress: payload.ipAddress || null,
        metadata: payload.metadata,
      },
    });
  } catch {
    // Non-blocking audit record
  }
}

export class AdminService {
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

    await recordAdminAudit({
      userId: creatorId || admin.id,
      userEmail: creatorEmail || 'admin@kissanmithar.in',
      action: 'LOGIN',
      ipAddress: ip,
      metadata: {
        actionType: 'ADMIN_USER_CREATED',
        createdAdminId: admin.id,
        createdAdminEmail: admin.email,
        createdAdminName: admin.name,
      },
    });

    return admin;
  }

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

    await recordAdminAudit({
      userId: updaterId || id,
      userEmail: updaterEmail || 'admin@kissanmithar.in',
      action: 'LOGIN',
      ipAddress: ip,
      metadata: {
        actionType: 'ADMIN_USER_UPDATED',
        targetAdminId: id,
        targetAdminEmail: updated.email,
        passwordChanged: Boolean(data.password),
      },
    });

    return updated;
  }

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

    await recordAdminAudit({
      userId: deleterId || id,
      userEmail: deleterEmail || 'admin@kissanmithar.in',
      action: 'LOGOUT',
      ipAddress: ip,
      metadata: {
        actionType: 'ADMIN_USER_DELETED',
        deletedAdminId: id,
        deletedAdminEmail: existing.email,
      },
    });

    return { success: true, message: `Administrator ${existing.name} has been deleted.` };
  }

  static async getSystemHealth() {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
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

    const downstreamProbes: Record<string, string> = {};
    const serviceUrls: Array<[string, string]> = [
      ['mediaService', env.MEDIA_SERVICE_URL],
      ['notificationService', env.NOTIFICATION_SERVICE_URL],
      ['fieldService', env.FIELD_SERVICE_URL],
      ['marketplaceService', env.MARKETPLACE_SERVICE_URL],
      ['aiService', env.AI_SERVICE_URL],
      ['identityService', env.IDENTITY_SERVICE_URL],
      ['analyticsService', env.ANALYTICS_SERVICE_URL],
      ['mlService', env.ML_SERVICE_URL],
    ];

    await Promise.all(
      serviceUrls
        .filter(([, url]) => Boolean(url))
        .map(async ([name, url]) => {
          try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 1500);
            const r = await fetch(`${url.replace(/\/+$/, '')}/health`, { signal: ctrl.signal });
            clearTimeout(timer);
            downstreamProbes[name] = r.ok ? 'healthy' : `degraded_${r.status}`;
          } catch {
            downstreamProbes[name] = 'unreachable';
          }
        })
    );

    return {
      status: dbStatus === 'healthy' ? 'operational' : 'degraded',
      architecture: 'microservices',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        provider: 'Supabase PostgreSQL Pooler',
      },
      microservices: downstreamProbes,
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
      security: {
        recent24hAuditEvents: recentAuditCount,
      },
    };
  }
}
