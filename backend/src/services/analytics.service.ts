import { prisma } from '../config/db.js';

export class AnalyticsService {
  /**
   * Generates a real-time analytics summary from the database
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
}
