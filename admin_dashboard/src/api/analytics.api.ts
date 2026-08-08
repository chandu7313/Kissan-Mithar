import { AnalyticsSummary } from '../types/index.js';

export class AnalyticsApi {
  static async getSummary(): Promise<AnalyticsSummary> {
    return {
      totalRequests: 48,
      pendingReviews: 12,
      reportsCompleted: 34,
      activeConsultations: 8,
      avgTurnaroundDays: 1.8,
      farmerSatisfaction: 4.9,
      statusBreakdown: {
        SUBMITTED: 6,
        UNDER_REVIEW: 8,
        EXPERT_ASSIGNED: 4,
        PLAN_READY: 22,
        COMPLETED: 8,
      },
      cropDemand: [
        { crop: 'Mango (Kesar/Alphonso)', percentage: 38 },
        { crop: 'Guava (Taiwan Pink)', percentage: 27 },
        { crop: 'Pomegranate (Bhagwa)', percentage: 18 },
        { crop: 'Custard Apple (Balanagar)', percentage: 10 },
        { crop: 'Citrus (Mosambi)', percentage: 7 },
      ],
    };
  }
}
