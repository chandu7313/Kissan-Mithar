require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const [
      totalRequests,
      submittedCount,
      underReviewCount,
      expertAssignedCount,
      planReadyCount,
      completedCount,
      activeConsultations,
      totalFarmers,
      totalExperts,
    ] = await Promise.all([
      prisma.orchardRequest.count(),
      prisma.orchardRequest.count({ where: { status: 'SUBMITTED' } }),
      prisma.orchardRequest.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.orchardRequest.count({ where: { status: 'EXPERT_ASSIGNED' } }),
      prisma.orchardRequest.count({ where: { status: 'PLAN_READY' } }),
      prisma.orchardRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.consultation.count({ where: { status: 'SCHEDULED' } }),
      prisma.farmer.count(),
      prisma.expert.count(),
    ]);
    console.log('Counts:', { totalRequests, submittedCount });

    const expertStats = await prisma.expert.aggregate({
      _avg: { rating: true },
    });
    console.log('Expert stats:', expertStats);

    const completedRequests = await prisma.orchardRequest.findMany({
      where: { status: { in: ['COMPLETED', 'PLAN_READY'] } },
      select: { submittedAt: true, updatedAt: true },
    });
    console.log('Completed requests length:', completedRequests.length);

    let avgTurnaroundDays = 0;
    if (completedRequests.length > 0) {
      const totalMs = completedRequests.reduce((acc, req) => {
        return acc + (req.updatedAt.getTime() - req.submittedAt.getTime());
      }, 0);
      avgTurnaroundDays = Number((totalMs / completedRequests.length / (1000 * 60 * 60 * 24)).toFixed(1));
    }
    console.log('Avg Turnaround:', avgTurnaroundDays);

    const reports = await prisma.orchardReport.findMany({
      select: { recommendedVarieties: true },
    });
    console.log('Reports length:', reports.length);

    const cropCounter = {};
    for (const rep of reports) {
      const varieties = rep.recommendedVarieties;
      if (Array.isArray(varieties)) {
        for (const item of varieties) {
          if (item?.crop) {
            const cropName = item.crop.trim();
            cropCounter[cropName] = (cropCounter[cropName] || 0) + 1;
          }
        }
      }
    }
    console.log('Crop demand done');

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
