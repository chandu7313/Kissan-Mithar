import { prisma } from '../config/db.js';

export class AnalyticsService {
  /**
   * Generates a real-time analytics summary from the database (Backward-compatible)
   */
  static async getDashboardSummary() {
    // Execute sequentially to guarantee we only use 1 connection and prevent pool exhaustion
    const requestStatusCounts = await prisma.orchardRequest.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const totalRequests = await prisma.orchardRequest.count();
    const activeConsultations = await prisma.consultation.count({ where: { status: 'SCHEDULED' } });
    const totalFarmers = await prisma.farmer.count();
    const totalExperts = await prisma.expert.count();

    // Map the status counts to variables for easy access
    let submittedCount = 0;
    let underReviewCount = 0;
    let expertAssignedCount = 0;
    let planReadyCount = 0;
    let completedCount = 0;

    for (const row of requestStatusCounts) {
      if (row.status === 'SUBMITTED') submittedCount = row._count._all;
      if (row.status === 'UNDER_REVIEW') underReviewCount = row._count._all;
      if (row.status === 'EXPERT_ASSIGNED') expertAssignedCount = row._count._all;
      if (row.status === 'PLAN_READY') planReadyCount = row._count._all;
      if (row.status === 'COMPLETED') completedCount = row._count._all;
    }

    // Compute average expert rating
    const expertStats = await prisma.expert.aggregate({
      _avg: { rating: true },
    });
    const avgRating = expertStats._avg.rating ? Number(expertStats._avg.rating.toFixed(1)) : 4.8;

    // Calculate Average Turnaround Time from COMPLETED and PLAN_READY requests
    const completedRequests = await prisma.orchardRequest.findMany({
      where: { status: { in: ['COMPLETED', 'PLAN_READY'] } },
      select: { submittedAt: true, updatedAt: true },
    });

    let avgTurnaroundDays = 0;
    if (completedRequests.length > 0) {
      const totalMs = completedRequests.reduce((acc, req) => {
        return acc + (req.updatedAt.getTime() - req.submittedAt.getTime());
      }, 0);
      avgTurnaroundDays = Number((totalMs / completedRequests.length / (1000 * 60 * 60 * 24)).toFixed(1));
    }

    // Get true crop demand from orchard report recommendations
    const reports = await prisma.orchardReport.findMany({
      select: { recommendedVarieties: true },
    });

    const cropCounter: Record<string, number> = {};
    for (const rep of reports) {
      const varieties = rep.recommendedVarieties as any[];
      if (Array.isArray(varieties)) {
        for (const item of varieties) {
          if (item?.crop) {
            const cropName = item.crop.trim();
            cropCounter[cropName] = (cropCounter[cropName] || 0) + 1;
          }
        }
      }
    }

    const totalCropMentions = Object.values(cropCounter).reduce((a, b) => a + b, 0) || 1;
    const cropDemand = Object.entries(cropCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([crop, count]) => ({
        crop,
        percentage: Math.round((count / totalCropMentions) * 100),
      }));

    return {
      totalRequests,
      pendingReviews: submittedCount + underReviewCount,
      reportsCompleted: planReadyCount + completedCount,
      activeConsultations,
      totalFarmers,
      totalExperts,
      avgTurnaroundDays,
      farmerSatisfaction: avgRating,
      statusBreakdown: {
        SUBMITTED: submittedCount,
        UNDER_REVIEW: underReviewCount,
        EXPERT_ASSIGNED: expertAssignedCount,
        PLAN_READY: planReadyCount,
        COMPLETED: completedCount,
      },
      cropDemand,
    };
  }

  /**
   * Enterprise Multi-Service Executive Summary for Production Admin Control Center
   */
  static async getExecutiveSummary(timeRange: '7d' | '30d' | '90d' | 'all' = '30d') {
    let dateFilter: Date | null = null;
    const now = Date.now();

    if (timeRange === '7d') dateFilter = new Date(now - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') dateFilter = new Date(now - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === '90d') dateFilter = new Date(now - 90 * 24 * 60 * 60 * 1000);

    const timeWhere = dateFilter ? { createdAt: { gte: dateFilter } } : {};
    const submittedWhere = dateFilter ? { submittedAt: { gte: dateFilter } } : {};

    // 1. Farmer Metrics
    const [totalFarmers, newFarmersInPeriod, totalDevices, activeDevices] = await Promise.all([
      prisma.farmer.count(),
      dateFilter ? prisma.farmer.count({ where: timeWhere }) : prisma.farmer.count(),
      prisma.device.count(),
      prisma.device.count({
        where: { lastActive: { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    // 2. Service Volumes & Status Breakdown
    const [
      orchardCounts,
      fertilizerCounts,
      diseaseCounts,
      labourCounts,
      consultationCounts,
    ] = await Promise.all([
      prisma.orchardRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.fertilizerRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.diseaseRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.labourRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.consultation.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const formatBreakdown = (counts: any[]) => {
      const map: Record<string, number> = {};
      let total = 0;
      for (const c of counts) {
        map[c.status] = c._count._all;
        total += c._count._all;
      }
      return { total, byStatus: map };
    };

    const orchards = formatBreakdown(orchardCounts);
    const fertilizers = formatBreakdown(fertilizerCounts);
    const diseases = formatBreakdown(diseaseCounts);
    const labour = formatBreakdown(labourCounts);
    const consultations = formatBreakdown(consultationCounts);

    // 3. AgriBazaar Marketplace
    const [
      totalListings,
      activeListings,
      totalProcurementRequests,
      activeProcurementRequests,
      totalMatches,
    ] = await Promise.all([
      prisma.agriProductListing.count(),
      prisma.agriProductListing.count({ where: { status: 'ACTIVE' } }),
      prisma.agriProductRequest.count(),
      prisma.agriProductRequest.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'SOURCING_IN_PROGRESS', 'SUPPLIER_IDENTIFIED'] },
        },
      }),
      prisma.agriProductRequestMatch.count(),
    ]);

    // 4. Staffing
    const [totalAdmins, totalExperts] = await Promise.all([
      prisma.admin.count(),
      prisma.expert.count(),
    ]);

    // 5. Recent Operational Stream (Latest 8 items across services)
    const [recentOrchards, recentFertilizers, recentDiseases, recentLabour] = await Promise.all([
      prisma.orchardRequest.findMany({
        take: 3,
        orderBy: { submittedAt: 'desc' },
        include: { farmer: { select: { name: true, phoneNumber: true, village: true } } },
      }),
      prisma.fertilizerRequest.findMany({
        take: 3,
        orderBy: { submittedAt: 'desc' },
        include: { farmer: { select: { name: true, phoneNumber: true, village: true } } },
      }),
      prisma.diseaseRequest.findMany({
        take: 3,
        orderBy: { submittedAt: 'desc' },
        include: { farmer: { select: { name: true, phoneNumber: true, village: true } } },
      }),
      prisma.labourRequest.findMany({
        take: 3,
        orderBy: { submittedAt: 'desc' },
        include: { farmer: { select: { name: true, phoneNumber: true, village: true } } },
      }),
    ]);

    const recentEvents = [
      ...recentOrchards.map((o) => ({
        id: o.id,
        service: 'ORCHARD_PLAN',
        serviceName: 'Orchard Survey',
        farmerName: o.farmer.name,
        village: o.farmer.village || 'N/A',
        status: o.status,
        timestamp: o.submittedAt,
      })),
      ...recentFertilizers.map((f) => ({
        id: f.id,
        service: 'FERTILIZER_GUIDE',
        serviceName: `Fertilizer (${f.cropType || 'Crop'})`,
        farmerName: f.farmer.name,
        village: f.farmer.village || 'N/A',
        status: f.status,
        timestamp: f.submittedAt,
      })),
      ...recentDiseases.map((d) => ({
        id: d.id,
        service: 'DISEASE_HELP',
        serviceName: `Crop Disease (${d.cropType || 'Pathology'})`,
        farmerName: d.farmer.name,
        village: d.farmer.village || 'N/A',
        status: d.status,
        timestamp: d.submittedAt,
      })),
      ...recentLabour.map((l) => ({
        id: l.id,
        service: 'LABOUR_REQUEST',
        serviceName: `Labour (${l.taskType})`,
        farmerName: l.farmer.name,
        village: l.farmer.village || 'N/A',
        status: l.status,
        timestamp: l.submittedAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const totalActiveServiceRequests =
      (orchards.byStatus['SUBMITTED'] || 0) +
      (orchards.byStatus['UNDER_REVIEW'] || 0) +
      (fertilizers.byStatus['SUBMITTED'] || 0) +
      (fertilizers.byStatus['UNDER_REVIEW'] || 0) +
      (diseases.byStatus['SUBMITTED'] || 0) +
      (diseases.byStatus['UNDER_REVIEW'] || 0) +
      (labour.byStatus['SUBMITTED'] || 0) +
      (labour.byStatus['UNDER_REVIEW'] || 0);

    const totalCompletedServiceRequests =
      (orchards.byStatus['COMPLETED'] || 0) +
      (orchards.byStatus['PLAN_READY'] || 0) +
      (fertilizers.byStatus['COMPLETED'] || 0) +
      (fertilizers.byStatus['PLAN_READY'] || 0) +
      (diseases.byStatus['COMPLETED'] || 0) +
      (diseases.byStatus['DIAGNOSED'] || 0) +
      (labour.byStatus['COMPLETED'] || 0);

    return {
      timeRange,
      periodLabel: timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : timeRange === '90d' ? 'Last 90 Days' : 'All Time',
      farmers: {
        total: totalFarmers,
        newInPeriod: newFarmersInPeriod,
        totalDevices,
        activeDevices30d: activeDevices,
      },
      services: {
        totalActive: totalActiveServiceRequests,
        totalCompleted: totalCompletedServiceRequests,
        orchards,
        fertilizers,
        diseases,
        labour,
        consultations,
      },
      bazaar: {
        totalListings,
        activeListings,
        totalProcurementRequests,
        activeProcurementRequests,
        totalMatches,
      },
      staff: {
        totalAdmins,
        totalExperts,
      },
      recentEvents,
    };
  }
}
