require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.time('Total Time');
    
    console.time('groupBy');
    await prisma.orchardRequest.groupBy({ by: ['status'], _count: { _all: true } });
    console.timeEnd('groupBy');

    console.time('countTotalReqs');
    await prisma.orchardRequest.count();
    console.timeEnd('countTotalReqs');

    console.time('countConsultations');
    await prisma.consultation.count({ where: { status: 'SCHEDULED' } });
    console.timeEnd('countConsultations');

    console.time('countFarmers');
    await prisma.farmer.count();
    console.timeEnd('countFarmers');

    console.time('countExperts');
    await prisma.expert.count();
    console.timeEnd('countExperts');

    console.time('expertStats');
    await prisma.expert.aggregate({ _avg: { rating: true } });
    console.timeEnd('expertStats');

    console.time('completedRequests');
    await prisma.orchardRequest.findMany({
      where: { status: { in: ['COMPLETED', 'PLAN_READY'] } },
      select: { submittedAt: true, updatedAt: true },
    });
    console.timeEnd('completedRequests');

    console.time('reports');
    await prisma.orchardReport.findMany({ select: { recommendedVarieties: true } });
    console.timeEnd('reports');

    console.timeEnd('Total Time');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
