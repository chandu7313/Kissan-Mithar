import { prisma } from '../config/db.js';

export class MandiPriceService {
  /**
   * Fetches mandi prices with optional filters
   */
  static async getPrices(filter: {
    commodity?: string;
    state?: string;
    market?: string;
    limit?: number;
  }) {
    return await prisma.mandiPrice.findMany({
      where: {
        ...(filter.commodity ? { commodity: { contains: filter.commodity, mode: 'insensitive' as any } } : {}),
        ...(filter.state ? { state: { contains: filter.state, mode: 'insensitive' as any } } : {}),
        ...(filter.market ? { market: { contains: filter.market, mode: 'insensitive' as any } } : {}),
      },
      orderBy: { priceDate: 'desc' },
      take: filter.limit || 50,
    });
  }

  /**
   * Get distinct commodities for filter dropdowns
   */
  static async getCommodities() {
    const prices = await prisma.mandiPrice.findMany({
      select: { commodity: true, variety: true },
      distinct: ['commodity'],
      orderBy: { commodity: 'asc' },
    });
    return prices;
  }

  /**
   * Upsert a mandi price record (for admin or cron ingestion)
   */
  static async upsertPrice(data: {
    commodity: string;
    variety?: string;
    market: string;
    district: string;
    state: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    trend?: string;
  }) {
    return await prisma.mandiPrice.create({
      data: {
        commodity: data.commodity,
        variety: data.variety,
        market: data.market,
        district: data.district,
        state: data.state,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        modalPrice: data.modalPrice,
        trend: data.trend || 'STABLE',
      },
    });
  }
}
