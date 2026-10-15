import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NotificationService } from './notification.service.js';
import { getIO } from '../config/socket.js';
import { AgriBazaarRequestStatus, AgriBazaarListingStatus } from '@prisma/client';

// ==========================================
// SUPPORTED UNITS & NORMALIZATION
// ==========================================

export const SUPPORTED_QUANTITY_UNITS = [
  'kg',
  'kilogram',
  'kilograms',
  'quintal',
  'quintals',
  'tonne',
  'ton',
  'tonnes',
  'tons',
  'metric ton',
  'gram',
  'grams',
  'crate',
  'crates',
  'box',
  'boxes',
  'bag',
  'bags',
  'sack',
  'sacks',
  'piece',
  'pieces',
  'dozen',
  'dozens',
  'bundle',
  'bundles',
] as const;

export const SUPPORTED_PRICE_UNITS = [
  '₹/kg',
  '₹/quintal',
  '₹/tonne',
  '₹/ton',
  '₹/crate',
  '₹/box',
  '₹/bag',
  '₹/piece',
  'per kg',
  'per quintal',
  'per tonne',
  'per ton',
  'per crate',
  'per bag',
  'per piece',
  '₹ / kg',
  '₹ / quintal',
  '₹ / tonne',
  '₹ / crate',
  '₹ / bag',
  '₹ / piece',
] as const;

/**
 * Checks if a quantity unit is in the supported list (case-insensitive)
 */
export function isValidQuantityUnit(unit?: string): boolean {
  if (!unit) return false;
  const clean = unit.trim().toLowerCase();
  return (SUPPORTED_QUANTITY_UNITS as readonly string[]).includes(clean);
}

/**
 * Checks if a price unit is in the supported list (case-insensitive)
 */
export function isValidPriceUnit(unit?: string): boolean {
  if (!unit) return false;
  const clean = unit.trim().toLowerCase();
  return (SUPPORTED_PRICE_UNITS as readonly string[]).includes(clean);
}

/**
 * Normalizes weight units to standard Kilograms for unambiguous mathematical comparison.
 * Returns null if the unit is non-weight based (e.g., crates, pieces, boxes) where conversion
 * would be speculative.
 */
export function toKilograms(val: number, unit: string): number | null {
  const u = unit.trim().toLowerCase();
  switch (u) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return val;
    case 'gram':
    case 'grams':
      return val / 1000;
    case 'quintal':
    case 'quintals':
      return val * 100;
    case 'tonne':
    case 'tonnes':
    case 'ton':
    case 'tons':
    case 'metric ton':
      return val * 1000;
    default:
      return null;
  }
}

/**
 * Converts quantity from one unit to another if conversion is valid and unambiguous.
 * Returns null if units are incompatible (e.g. kg to crates without known weight).
 */
export function convertQuantity(val: number, fromUnit: string, toUnit: string): number | null {
  const f = fromUnit.trim().toLowerCase();
  const t = toUnit.trim().toLowerCase();
  if (f === t) return val;

  const fromKg = toKilograms(val, f);
  if (fromKg === null) return null; // Non-weight unit

  switch (t) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return fromKg;
    case 'quintal':
    case 'quintals':
      return fromKg / 100;
    case 'tonne':
    case 'tonnes':
    case 'ton':
    case 'tons':
    case 'metric ton':
      return fromKg / 1000;
    case 'gram':
    case 'grams':
      return fromKg * 1000;
    default:
      return null;
  }
}

export interface QuantityMatchEvaluation {
  compatible: boolean;
  status: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNVERIFIED' | 'INCOMPATIBLE_UNITS';
  notes: string;
}

/**
 * Evaluates whether a seller's quantity range is compatible with a buyer's fixed required quantity.
 */
export function evaluateQuantityMatch(
  buyerQty: number,
  buyerUnit: string,
  sellerMin?: number | null,
  sellerMax?: number | null,
  sellerUnit?: string | null
): QuantityMatchEvaluation {
  // If seller did not specify min and max quantities, mark as unverified
  if ((sellerMin == null || sellerMin === undefined) && (sellerMax == null || sellerMax === undefined)) {
    return {
      compatible: false,
      status: 'UNVERIFIED',
      notes: 'Quantity unverified: Seller has not specified available volume range',
    };
  }

  const sUnit = sellerUnit || buyerUnit;
  const convertedMin = sellerMin != null ? convertQuantity(sellerMin, sUnit, buyerUnit) : null;
  const convertedMax = sellerMax != null ? convertQuantity(sellerMax, sUnit, buyerUnit) : null;

  // If units cannot be converted
  if (sUnit.toLowerCase() !== buyerUnit.toLowerCase() && (convertedMin === null || convertedMax === null)) {
    return {
      compatible: false,
      status: 'INCOMPATIBLE_UNITS',
      notes: `Incompatible units: Cannot compare buyer ${buyerUnit} with seller ${sUnit}`,
    };
  }

  const effectiveMin = convertedMin != null ? convertedMin : (sellerMin != null ? sellerMin : 0);
  const effectiveMax = convertedMax != null ? convertedMax : (sellerMax != null ? sellerMax : Infinity);

  if (buyerQty < effectiveMin) {
    return {
      compatible: false,
      status: 'OUT_OF_RANGE',
      notes: `Required quantity (${buyerQty} ${buyerUnit}) is below seller minimum (${effectiveMin} ${buyerUnit})`,
    };
  }

  if (buyerQty > effectiveMax) {
    return {
      compatible: false,
      status: 'OUT_OF_RANGE',
      notes: `Required quantity (${buyerQty} ${buyerUnit}) exceeds seller maximum (${effectiveMax} ${buyerUnit})`,
    };
  }

  return {
    compatible: true,
    status: 'IN_RANGE',
    notes: `Required quantity is within seller availability (${effectiveMin} - ${effectiveMax} ${buyerUnit})`,
  };
}

// ==========================================
// INPUT INTERFACES
// ==========================================

export interface CreateListingInput {
  sellerId: string;
  productName?: string;
  variety?: string;
  minQuantity?: number;
  maxQuantity?: number;
  quantityUnit?: string;
  price?: number;
  priceUnit?: string;
  locationType?: 'CURRENT' | 'MANUAL';
  locationName?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  notes?: string;
}

export interface CreateRequestInput {
  buyerId: string;
  productName: string;
  variety?: string;
  requiredQuantity: number;
  quantityUnit: string;
  expectedPrice?: number;
  priceUnit?: string;
  locationType?: 'CURRENT' | 'MANUAL';
  locationName?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  minQuantity?: any; // To defensively catch and reject
  maxQuantity?: any; // To defensively catch and reject
}

// ==========================================
// VALID STATUS LIFECYCLE TRANSITIONS
// ==========================================

export const VALID_STATUS_TRANSITIONS: Record<AgriBazaarRequestStatus, AgriBazaarRequestStatus[]> = {
  SUBMITTED: [AgriBazaarRequestStatus.UNDER_REVIEW, AgriBazaarRequestStatus.CANCELLED],
  UNDER_REVIEW: [AgriBazaarRequestStatus.SOURCING_IN_PROGRESS, AgriBazaarRequestStatus.SUBMITTED, AgriBazaarRequestStatus.CANCELLED],
  SOURCING_IN_PROGRESS: [AgriBazaarRequestStatus.SUPPLIER_IDENTIFIED, AgriBazaarRequestStatus.UNDER_REVIEW, AgriBazaarRequestStatus.CANCELLED],
  SUPPLIER_IDENTIFIED: [AgriBazaarRequestStatus.VERIFICATION_IN_PROGRESS, AgriBazaarRequestStatus.SOURCING_IN_PROGRESS, AgriBazaarRequestStatus.CANCELLED],
  VERIFICATION_IN_PROGRESS: [AgriBazaarRequestStatus.PROCUREMENT_IN_PROGRESS, AgriBazaarRequestStatus.SOURCING_IN_PROGRESS, AgriBazaarRequestStatus.CANCELLED],
  PROCUREMENT_IN_PROGRESS: [AgriBazaarRequestStatus.DELIVERY_IN_PROGRESS, AgriBazaarRequestStatus.CANCELLED],
  DELIVERY_IN_PROGRESS: [AgriBazaarRequestStatus.DELIVERED, AgriBazaarRequestStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
};

export class AgriBazaarService {
  // ==========================================
  // SELLER LISTING OPERATIONS
  // ==========================================

  /**
   * Register a new seller product listing with full validation
   */
  static async createListing(data: CreateListingInput) {
    // Validate quantity ranges: must be positive (> 0) if provided
    if (data.minQuantity !== undefined && data.minQuantity !== null && data.minQuantity <= 0) {
      throw new AppError('Minimum quantity must be greater than zero', 400);
    }
    if (data.maxQuantity !== undefined && data.maxQuantity !== null && data.maxQuantity <= 0) {
      throw new AppError('Maximum quantity must be greater than zero', 400);
    }
    if (
      data.minQuantity !== undefined &&
      data.minQuantity !== null &&
      data.maxQuantity !== undefined &&
      data.maxQuantity !== null &&
      data.minQuantity > data.maxQuantity
    ) {
      throw new AppError('Minimum quantity cannot exceed maximum quantity', 400);
    }

    // Validate units if quantity is specified
    if ((data.minQuantity !== undefined || data.maxQuantity !== undefined) && data.quantityUnit) {
      if (!isValidQuantityUnit(data.quantityUnit)) {
        throw new AppError(
          `Unsupported quantity unit: '${data.quantityUnit}'. Supported units include: kg, quintal, tonne, box, bag, piece.`,
          400
        );
      }
    }

    // Validate price: must be non-negative (>= 0)
    if (data.price !== undefined && data.price !== null) {
      if (data.price < 0) {
        throw new AppError('Price must be a non-negative number', 400);
      }
      if (data.priceUnit && !isValidPriceUnit(data.priceUnit)) {
        throw new AppError(
          `Unsupported price unit: '${data.priceUnit}'. Supported units include: ₹/kg, ₹/quintal, ₹/tonne, per kg, per piece.`,
          400
        );
      }
    }

    // Validate coordinates if provided
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      throw new AppError('Latitude must be between -90 and 90 degrees', 400);
    }
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      throw new AppError('Longitude must be between -180 and 180 degrees', 400);
    }

    const listing = await prisma.agriProductListing.create({
      data: {
        sellerId: data.sellerId,
        productName: data.productName?.trim() || null,
        variety: data.variety?.trim() || null,
        minQuantity: data.minQuantity != null ? data.minQuantity : null,
        maxQuantity: data.maxQuantity != null ? data.maxQuantity : null,
        quantityUnit: data.quantityUnit?.trim() || null,
        price: data.price != null ? data.price : null,
        priceUnit: data.priceUnit?.trim() || null,
        locationType: data.locationType || 'MANUAL',
        locationName: data.locationName?.trim() || null,
        village: data.village?.trim() || null,
        mandal: data.mandal?.trim() || null,
        district: data.district?.trim() || null,
        state: data.state?.trim() || null,
        pincode: data.pincode?.trim() || null,
        latitude: data.latitude != null ? data.latitude : null,
        longitude: data.longitude != null ? data.longitude : null,
        photos: data.photos || [],
        notes: data.notes?.trim() || null,
        status: AgriBazaarListingStatus.ACTIVE,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
          },
        },
      },
    });

    // Notify staff of new listing registration via socket
    try {
      const io = getIO();
      if (io) {
        io.emit('bazaar:listing_created', {
          id: listing.id,
          productName: listing.productName,
          sellerName: listing.seller.name,
        });
      }
    } catch {
      // Non-blocking
    }

    return listing;
  }

  /**
   * Get single listing by ID with strict privacy masking
   */
  static async getListingById(id: string, userRole?: string, userId?: string) {
    const listing = await prisma.agriProductListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
          },
        },
      },
    });

    if (!listing) {
      throw new AppError('Product listing not found', 404);
    }

    const isAdmin = userRole === 'ADMIN' || userRole === 'EXPERT';
    const isOwner = userId === listing.sellerId;

    // Mask privacy details if not admin and not the owner
    if (!isAdmin && !isOwner) {
      return {
        ...listing,
        adminNotes: undefined,
        seller: {
          id: listing.seller.id,
          name: 'Verified Supplier',
          phoneNumber: undefined,
          village: listing.seller.village,
          district: listing.seller.district,
          state: listing.seller.state,
        },
      };
    }

    return listing;
  }

  /**
   * List seller product listings with filtering and privacy masking
   */
  static async listListings(
    filters: {
      status?: AgriBazaarListingStatus;
      productName?: string;
      sellerId?: string;
      phoneNumber?: string;
      district?: string;
      state?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    userRole?: string,
    userId?: string
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    } else if (userRole !== 'ADMIN') {
      where.status = AgriBazaarListingStatus.ACTIVE;
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    } else if (filters.phoneNumber) {
      where.seller = { phoneNumber: filters.phoneNumber };
    }

    if (filters.district) {
      where.district = { contains: filters.district, mode: 'insensitive' };
    }

    if (filters.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { productName: { contains: filters.search, mode: 'insensitive' } },
        { variety: { contains: filters.search, mode: 'insensitive' } },
        { locationName: { contains: filters.search, mode: 'insensitive' } },
      ];
    } else if (filters.productName) {
      where.productName = { contains: filters.productName, mode: 'insensitive' };
    }

    const [total, listings] = await Promise.all([
      prisma.agriProductListing.count({ where }),
      prisma.agriProductListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              village: true,
              district: true,
              state: true,
            },
          },
        },
      }),
    ]);

    const isAdmin = userRole === 'ADMIN' || userRole === 'EXPERT';

    // Mask privacy details for unauthorized viewers
    const sanitized = listings.map((l) => {
      const isOwner = userId === l.sellerId || (filters.phoneNumber && l.seller.phoneNumber === filters.phoneNumber);
      if (!isAdmin && !isOwner) {
        return {
          ...l,
          adminNotes: undefined,
          seller: {
            id: l.seller.id,
            name: 'Verified Supplier',
            phoneNumber: undefined,
            village: l.seller.village,
            district: l.seller.district,
            state: l.seller.state,
          },
        };
      }
      return l;
    });

    return {
      listings: sanitized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update seller listing with ownership enforcement and validation
   */
  static async updateListing(
    id: string,
    data: Partial<CreateListingInput> & { status?: AgriBazaarListingStatus },
    userId: string,
    isAdmin = false
  ) {
    const listing = await prisma.agriProductListing.findUnique({ where: { id } });
    if (!listing) throw new AppError('Listing not found', 404);

    if (!isAdmin && listing.sellerId !== userId) {
      throw new AppError('Unauthorized to update this listing', 403);
    }

    if (data.minQuantity !== undefined && data.minQuantity !== null && data.minQuantity <= 0) {
      throw new AppError('Minimum quantity must be greater than zero', 400);
    }
    if (data.maxQuantity !== undefined && data.maxQuantity !== null && data.maxQuantity <= 0) {
      throw new AppError('Maximum quantity must be greater than zero', 400);
    }

    const finalMin = data.minQuantity !== undefined ? data.minQuantity : listing.minQuantity;
    const finalMax = data.maxQuantity !== undefined ? data.maxQuantity : listing.maxQuantity;
    if (finalMin != null && finalMax != null && finalMin > finalMax) {
      throw new AppError('Minimum quantity cannot exceed maximum quantity', 400);
    }

    if (data.quantityUnit && !isValidQuantityUnit(data.quantityUnit)) {
      throw new AppError(`Unsupported quantity unit: '${data.quantityUnit}'`, 400);
    }

    if (data.price !== undefined && data.price !== null) {
      if (data.price < 0) throw new AppError('Price must be a non-negative number', 400);
      if (data.priceUnit && !isValidPriceUnit(data.priceUnit)) {
        throw new AppError(`Unsupported price unit: '${data.priceUnit}'`, 400);
      }
    }

    return prisma.agriProductListing.update({
      where: { id },
      data: {
        productName: data.productName !== undefined ? data.productName?.trim() || null : undefined,
        variety: data.variety !== undefined ? data.variety?.trim() || null : undefined,
        minQuantity: data.minQuantity !== undefined ? data.minQuantity : undefined,
        maxQuantity: data.maxQuantity !== undefined ? data.maxQuantity : undefined,
        quantityUnit: data.quantityUnit !== undefined ? data.quantityUnit?.trim() || null : undefined,
        price: data.price !== undefined ? data.price : undefined,
        priceUnit: data.priceUnit !== undefined ? data.priceUnit?.trim() || null : undefined,
        locationType: data.locationType,
        locationName: data.locationName,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        photos: data.photos,
        notes: data.notes,
        status: data.status,
      },
    });
  }

  /**
   * Delete or archive seller listing with ownership enforcement
   */
  static async deleteListing(id: string, userId?: string, isAdmin = false) {
    const listing = await prisma.agriProductListing.findUnique({ where: { id } });
    if (!listing) throw new AppError('Listing not found', 404);

    if (!isAdmin && userId && listing.sellerId !== userId) {
      throw new AppError('Unauthorized to delete this listing', 403);
    }

    // Delete associated matches first
    await prisma.agriProductRequestMatch.deleteMany({
      where: { listingId: id },
    });

    return prisma.agriProductListing.delete({ where: { id } });
  }

  // ==========================================
  // BUYER PRODUCT REQUEST OPERATIONS
  // ==========================================

  /**
   * Submit a new buyer product request
   */
  static async createRequest(data: CreateRequestInput) {
    // Rejection rule: buyer must NOT specify minQuantity or maxQuantity
    if (data.minQuantity !== undefined || data.maxQuantity !== undefined) {
      throw new AppError(
        'Buyer requests must specify a single fixed requiredQuantity, not a quantity range.',
        400
      );
    }

    if (!data.productName || !data.productName.trim()) {
      throw new AppError('Product Name is required', 400);
    }

    if (
      data.requiredQuantity === undefined ||
      data.requiredQuantity === null ||
      data.requiredQuantity <= 0
    ) {
      throw new AppError('A positive required quantity is required', 400);
    }

    if (!data.quantityUnit || !data.quantityUnit.trim()) {
      throw new AppError('Quantity Unit is required', 400);
    }

    if (!isValidQuantityUnit(data.quantityUnit)) {
      throw new AppError(
        `Unsupported quantity unit: '${data.quantityUnit}'. Supported units: ${SUPPORTED_QUANTITY_UNITS.join(', ')}`,
        400
      );
    }

    if (data.expectedPrice !== undefined && data.expectedPrice !== null) {
      if (data.expectedPrice < 0) {
        throw new AppError('Expected price must be non-negative', 400);
      }
      if (!data.priceUnit || !isValidPriceUnit(data.priceUnit)) {
        throw new AppError(
          `A valid supported price unit is required when expected price is supplied. Supported units: ${SUPPORTED_PRICE_UNITS.join(', ')}`,
          400
        );
      }
    }

    // Location validation
    const hasLocation = Boolean(
      data.locationName?.trim() ||
        data.village?.trim() ||
        data.district?.trim() ||
        (data.latitude !== undefined && data.longitude !== undefined)
    );
    if (!hasLocation) {
      throw new AppError('Delivery location details or coordinates are required', 400);
    }

    // Coordinates range validation
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      throw new AppError('Latitude must be between -90 and 90 degrees', 400);
    }
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      throw new AppError('Longitude must be between -180 and 180 degrees', 400);
    }

    const request = await prisma.agriProductRequest.create({
      data: {
        buyerId: data.buyerId,
        productName: data.productName.trim(),
        variety: data.variety?.trim() || null,
        requiredQuantity: data.requiredQuantity,
        quantityUnit: data.quantityUnit.trim(),
        expectedPrice: data.expectedPrice != null ? data.expectedPrice : null,
        priceUnit: data.priceUnit?.trim() || null,
        locationType: data.locationType || 'MANUAL',
        locationName: data.locationName?.trim() || null,
        village: data.village?.trim() || null,
        mandal: data.mandal?.trim() || null,
        district: data.district?.trim() || null,
        state: data.state?.trim() || null,
        pincode: data.pincode?.trim() || null,
        latitude: data.latitude != null ? data.latitude : null,
        longitude: data.longitude != null ? data.longitude : null,
        photos: data.photos || [],
        status: AgriBazaarRequestStatus.SUBMITTED,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
          },
        },
      },
    });

    // Record initial status in request audit history
    try {
      await prisma.agriProductRequestHistory.create({
        data: {
          requestId: request.id,
          previousStatus: null,
          newStatus: AgriBazaarRequestStatus.SUBMITTED,
          changedBy: data.buyerId,
          internalNotes: 'Initial request submission',
        },
      });
    } catch {
      // Non-blocking
    }

    // Notify customer
    try {
      await NotificationService.sendNotification({
        farmerId: data.buyerId,
        type: 'MARKET',
        title: 'Agri Bazaar Request Received',
        body: `Your request for ${request.requiredQuantity} ${request.quantityUnit} of ${request.productName} has been submitted. Our team is reviewing suitable suppliers.`,
        data: { requestId: request.id },
      });
    } catch {
      // Non-blocking
    }

    // Broadcast to Admin sockets
    try {
      const io = getIO();
      if (io) {
        io.emit('bazaar:request_created', {
          id: request.id,
          productName: request.productName,
          requiredQuantity: request.requiredQuantity,
          quantityUnit: request.quantityUnit,
          buyerName: request.buyer.name,
        });
      }
    } catch {
      // Non-blocking
    }

    return request;
  }

  /**
   * Get single product request by ID with strict privacy protection
   */
  static async getRequestById(id: string, userRole?: string, userId?: string) {
    const request = await prisma.agriProductRequest.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
          },
        },
        matches: {
          include: {
            listing: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    village: true,
                    district: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      throw new AppError('Product request not found', 404);
    }

    const isAdmin = userRole === 'ADMIN' || userRole === 'EXPERT';
    const isOwner = userId === request.buyerId;

    if (!isAdmin && !isOwner) {
      // Public / third-party query: strictly sanitize all identity and commercial data
      return {
        ...request,
        adminNotes: undefined,
        verifiedQuantity: undefined,
        procurementCost: undefined,
        finalQuotePrice: undefined,
        matches: [],
        history: [],
        buyer: {
          id: request.buyer.id,
          name: 'Customer Request',
          phoneNumber: undefined,
          village: request.buyer.village,
          district: request.buyer.district,
          state: request.buyer.state,
        },
      };
    }

    if (isOwner && !isAdmin) {
      // Owner view: see their own data, but mask internal staff notes and matched supplier contacts
      return {
        ...request,
        adminNotes: undefined,
        procurementCost: undefined,
        history: request.history.map((h) => ({
          id: h.id,
          previousStatus: h.previousStatus,
          newStatus: h.newStatus,
          createdAt: h.createdAt,
          internalNotes: undefined,
        })),
        matches: request.matches.map((m) => ({
          id: m.id,
          status: m.status,
          listing: {
            id: m.listing.id,
            productName: m.listing.productName,
            variety: m.listing.variety,
            quantityUnit: m.listing.quantityUnit,
            seller: {
              id: m.listing.seller.id,
              name: 'Verified Supplier',
              phoneNumber: undefined,
              district: m.listing.seller.district,
              state: m.listing.seller.state,
            },
          },
        })),
      };
    }

    return request;
  }

  /**
   * List buyer product requests with filters and privacy handling
   */
  static async listRequests(
    filters: {
      status?: AgriBazaarRequestStatus;
      productName?: string;
      variety?: string;
      buyerId?: string;
      phoneNumber?: string;
      district?: string;
      state?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    userRole?: string,
    userId?: string
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.buyerId) {
      where.buyerId = filters.buyerId;
    } else if (filters.phoneNumber) {
      where.buyer = { phoneNumber: filters.phoneNumber };
    } else if (userRole === 'FARMER') {
      where.buyerId = userId;
    }

    if (filters.district) {
      where.district = { contains: filters.district, mode: 'insensitive' };
    }

    if (filters.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    if (filters.variety) {
      where.variety = { contains: filters.variety, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    if (filters.search) {
      where.OR = [
        { productName: { contains: filters.search, mode: 'insensitive' } },
        { variety: { contains: filters.search, mode: 'insensitive' } },
        { locationName: { contains: filters.search, mode: 'insensitive' } },
      ];
    } else if (filters.productName) {
      where.productName = { contains: filters.productName, mode: 'insensitive' };
    }

    const [total, requests] = await Promise.all([
      prisma.agriProductRequest.count({ where }),
      prisma.agriProductRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              village: true,
              district: true,
              state: true,
            },
          },
          matches: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const isAdmin = userRole === 'ADMIN' || userRole === 'EXPERT';

    const sanitized = requests.map((r) => {
      const isOwner = userId === r.buyerId || (filters.phoneNumber && r.buyer.phoneNumber === filters.phoneNumber);
      if (!isAdmin && !isOwner) {
        return {
          ...r,
          adminNotes: undefined,
          verifiedQuantity: undefined,
          procurementCost: undefined,
          finalQuotePrice: undefined,
          buyer: {
            id: r.buyer.id,
            name: 'Customer Request',
            phoneNumber: undefined,
            village: r.buyer.village,
            district: r.buyer.district,
            state: r.buyer.state,
          },
        };
      }
      return r;
    });

    return {
      requests: sanitized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a buyer product request
   */
  static async updateRequest(
    id: string,
    data: Partial<CreateRequestInput>,
    userId?: string,
    isAdmin = false
  ) {
    if (data.minQuantity !== undefined || data.maxQuantity !== undefined) {
      throw new AppError(
        'Buyer requests must specify a single fixed requiredQuantity, not a quantity range.',
        400
      );
    }

    const request = await prisma.agriProductRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Product request not found', 404);

    if (!isAdmin && userId && request.buyerId !== userId) {
      throw new AppError('Unauthorized to update this request', 403);
    }

    if (!isAdmin && request.status !== 'SUBMITTED' && request.status !== 'UNDER_REVIEW') {
      throw new AppError('Request can only be edited while under review or submitted', 400);
    }

    if (data.requiredQuantity !== undefined && data.requiredQuantity <= 0) {
      throw new AppError('Required quantity must be a positive number', 400);
    }

    if (data.quantityUnit && !isValidQuantityUnit(data.quantityUnit)) {
      throw new AppError(`Unsupported quantity unit: '${data.quantityUnit}'`, 400);
    }

    if (data.expectedPrice !== undefined && data.expectedPrice < 0) {
      throw new AppError('Expected price must be non-negative', 400);
    }

    return prisma.agriProductRequest.update({
      where: { id },
      data: {
        productName: data.productName ? data.productName.trim() : undefined,
        variety: data.variety !== undefined ? data.variety?.trim() || null : undefined,
        requiredQuantity: data.requiredQuantity,
        quantityUnit: data.quantityUnit ? data.quantityUnit.trim() : undefined,
        expectedPrice: data.expectedPrice,
        priceUnit: data.priceUnit?.trim(),
        locationType: data.locationType,
        locationName: data.locationName,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        photos: data.photos,
      },
    });
  }

  /**
   * Cancel a buyer product request with history audit logging
   */
  static async cancelRequest(id: string, userId?: string, isAdmin = false) {
    const request = await prisma.agriProductRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Product request not found', 404);

    if (!isAdmin && userId && request.buyerId !== userId) {
      throw new AppError('Unauthorized to cancel this request', 403);
    }

    if (!isAdmin && request.status !== 'SUBMITTED' && request.status !== 'UNDER_REVIEW') {
      throw new AppError(
        'Request cannot be cancelled at this stage. Please contact Kissan Mithar support.',
        400
      );
    }

    const updated = await prisma.agriProductRequest.update({
      where: { id },
      data: { status: AgriBazaarRequestStatus.CANCELLED },
    });

    // Record cancellation in audit history
    try {
      await prisma.agriProductRequestHistory.create({
        data: {
          requestId: id,
          previousStatus: request.status,
          newStatus: AgriBazaarRequestStatus.CANCELLED,
          changedBy: userId || 'CUSTOMER',
          internalNotes: 'Request cancelled by customer/admin',
        },
      });
    } catch {
      // Non-blocking
    }

    return updated;
  }

  // ==========================================
  // ADMIN SOURCING & MATCHING OPERATIONS
  // ==========================================

  /**
   * Update request status and internal sourcing coordination details with audit logging
   */
  static async updateRequestStatus(
    id: string,
    data: {
      status: AgriBazaarRequestStatus;
      adminNotes?: string;
      verifiedQuantity?: number;
      verifiedQuality?: string;
      procurementCost?: number;
      finalQuotePrice?: number;
    },
    staffUserId?: string
  ) {
    const existing = await prisma.agriProductRequest.findUnique({
      where: { id },
      include: { buyer: true },
    });

    if (!existing) {
      throw new AppError('Product request not found', 404);
    }

    if (existing.status !== data.status) {
      const allowed = VALID_STATUS_TRANSITIONS[existing.status] || [];
      // If transition is not standard, check if staff override or log warning
      if (!allowed.includes(data.status) && data.status !== AgriBazaarRequestStatus.CANCELLED) {
        // Enforce valid lifecycle flow
        throw new AppError(
          `Invalid status transition from '${existing.status}' to '${data.status}'. Allowed next stages: ${allowed.join(', ')}`,
          400
        );
      }
    }

    const updated = await prisma.agriProductRequest.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes,
        verifiedQuantity: data.verifiedQuantity !== undefined ? data.verifiedQuantity : existing.verifiedQuantity,
        verifiedQuality: data.verifiedQuality !== undefined ? data.verifiedQuality : existing.verifiedQuality,
        procurementCost: data.procurementCost !== undefined ? data.procurementCost : existing.procurementCost,
        finalQuotePrice: data.finalQuotePrice !== undefined ? data.finalQuotePrice : existing.finalQuotePrice,
      },
    });

    // Record in request status history
    try {
      await prisma.agriProductRequestHistory.create({
        data: {
          requestId: id,
          previousStatus: existing.status,
          newStatus: data.status,
          changedBy: staffUserId,
          internalNotes: data.adminNotes,
        },
      });
    } catch {
      // Non-blocking
    }

    // Friendly status labels for customer notifications
    const statusLabels: Record<AgriBazaarRequestStatus, string> = {
      SUBMITTED: 'Request Submitted',
      UNDER_REVIEW: 'Under Review by Kissan Mithar',
      SOURCING_IN_PROGRESS: 'Sourcing in Progress',
      SUPPLIER_IDENTIFIED: 'Supplier Identified',
      VERIFICATION_IN_PROGRESS: 'Quantity & Quality Verification',
      PROCUREMENT_IN_PROGRESS: 'Procurement in Progress',
      DELIVERY_IN_PROGRESS: 'Delivery in Progress',
      DELIVERED: 'Delivered Successfully',
      CANCELLED: 'Request Cancelled',
    };

    // Notify buyer about the status progression
    try {
      await NotificationService.sendNotification({
        farmerId: existing.buyerId,
        type: 'MARKET',
        title: `Agri Bazaar: ${statusLabels[data.status]}`,
        body: `Your request for ${existing.productName} is now: ${statusLabels[data.status]}. Kissan Mithar is coordinating the sourcing.`,
        data: { requestId: existing.id, status: data.status },
      });
    } catch {
      // Non-blocking
    }

    return updated;
  }

  /**
   * Get request status history audit trail
   */
  static async getRequestHistory(requestId: string, isAdmin = false) {
    const history = await prisma.agriProductRequestHistory.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });

    if (!isAdmin) {
      return history.map((h) => ({
        ...h,
        internalNotes: undefined,
      }));
    }

    return history;
  }

  /**
   * Match available suppliers for a given buyer request with unit-aware evaluation
   */
  static async findMatchesForRequest(requestId: string) {
    const request = await prisma.agriProductRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Product request not found', 404);
    }

    // Search active seller listings matching the produce name
    const listings = await prisma.agriProductListing.findMany({
      where: {
        status: AgriBazaarListingStatus.ACTIVE,
        productName: {
          contains: request.productName,
          mode: 'insensitive',
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            village: true,
            district: true,
            state: true,
          },
        },
      },
    });

    // Score and evaluate candidate matches:
    // 1. Variety check
    // 2. Unit-aware quantity compatibility evaluation
    // 3. Location proximity
    // 4. Pricing compatibility
    const scoredMatches = listings.map((l) => {
      let score = 50; // Base score for product name match

      // Variety match
      if (request.variety && l.variety) {
        const reqV = request.variety.toLowerCase();
        const listV = l.variety.toLowerCase();
        if (reqV.includes(listV) || listV.includes(reqV)) {
          score += 20;
        }
      }

      // Unit-aware quantity evaluation
      const qtyEvaluation = evaluateQuantityMatch(
        request.requiredQuantity,
        request.quantityUnit,
        l.minQuantity,
        l.maxQuantity,
        l.quantityUnit
      );

      if (qtyEvaluation.status === 'IN_RANGE') {
        score += 20;
      } else if (qtyEvaluation.status === 'UNVERIFIED') {
        score += 5; // Potential match with unverified quantity
      }

      // Location match
      if (request.district && l.district && request.district.toLowerCase() === l.district.toLowerCase()) {
        score += 15;
      } else if (request.state && l.state && request.state.toLowerCase() === l.state.toLowerCase()) {
        score += 10;
      }

      // Price compatibility
      if (request.expectedPrice && l.price) {
        if (l.price <= request.expectedPrice) {
          score += 10;
        }
      }

      return {
        listing: l,
        matchScore: score,
        quantityEvaluation: qtyEvaluation,
        quantityCompatible: qtyEvaluation.compatible,
        potentialSupplier: true, // Tagged as potential suppliers, not confirmed supply
      };
    });

    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      request,
      candidates: scoredMatches,
    };
  }

  /**
   * Link an identified supplier listing to a buyer request
   */
  static async createMatch(requestId: string, listingId: string, matchedBy?: string, internalNotes?: string) {
    const existing = await prisma.agriProductRequestMatch.findFirst({
      where: { requestId, listingId },
    });

    if (existing) {
      return prisma.agriProductRequestMatch.update({
        where: { id: existing.id },
        data: {
          internalNotes: internalNotes || existing.internalNotes,
        },
      });
    }

    const match = await prisma.agriProductRequestMatch.create({
      data: {
        requestId,
        listingId,
        matchedBy,
        internalNotes,
        status: 'POTENTIAL',
      },
    });

    return match;
  }

  /**
   * Update internal match status (e.g., CONTACTED, VERIFIED, SELECTED, REJECTED)
   */
  static async updateMatchStatus(matchId: string, status: string, internalNotes?: string) {
    return prisma.agriProductRequestMatch.update({
      where: { id: matchId },
      data: {
        status,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
      },
    });
  }
}
