import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AgriBazaarService } from '../services/agriBazaar.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../config/db.js';

export class AgriBazaarController {
  // ==========================================
  // SELLER LISTINGS
  // ==========================================

  /**
   * Register a new seller product listing
   */
  static async createListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Derive sellerId strictly from authenticated session/token, never trust client-supplied sellerId
      let sellerId = req.user?.farmerId || req.user?.userId;

      // Fallback to registered phone number if unauthenticated session
      if (!sellerId && req.body.phoneNumber) {
        const farmer = await prisma.farmer.findUnique({
          where: { phoneNumber: req.body.phoneNumber },
        });
        if (farmer) sellerId = farmer.id;
      }

      if (!sellerId) {
        throw new AppError('Authentication required or valid registered phone number must be provided', 401);
      }

      // Strip untrusted sellerId from request body to prevent ownership spoofing
      const { sellerId: _untrustedSellerId, ...safeBody } = req.body;

      const listing = await AgriBazaarService.createListing({
        ...safeBody,
        sellerId,
      });

      res.status(201).json({
        success: true,
        message: 'Product listed successfully on Agri Bazaar',
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse or filter seller product listings
   */
  static async listListings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, productName, sellerId, phoneNumber, district, state, search, page, limit } = req.query;

      const result = await AgriBazaarService.listListings(
        {
          status: status as any,
          productName: productName as string,
          sellerId: sellerId as string,
          phoneNumber: phoneNumber as string,
          district: district as string,
          state: state as string,
          search: search as string,
          page: page ? parseInt(page as string, 10) : 1,
          limit: limit ? parseInt(limit as string, 10) : 20,
        },
        req.user?.role,
        req.user?.farmerId || req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: result.listings,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get listing by ID
   */
  static async getListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const listing = await AgriBazaarService.getListingById(
        id,
        req.user?.role,
        req.user?.farmerId || req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update seller listing
   */
  static async updateListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'EXPERT';
      const userId = req.user?.farmerId || req.user?.userId || '';

      const updated = await AgriBazaarService.updateListing(id, req.body, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Product listing updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete seller listing
   */
  static async deleteListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'EXPERT';
      const userId = req.user?.farmerId || req.user?.userId || '';

      await AgriBazaarService.deleteListing(id, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Product listing deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // BUYER PRODUCT REQUESTS
  // ==========================================

  /**
   * Submit a new buyer product request
   */
  static async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Derive buyerId strictly from authenticated session/token, never trust client-supplied buyerId
      let buyerId = req.user?.farmerId || req.user?.userId;

      // Fallback to registered phone number if unauthenticated session
      if (!buyerId && req.body.phoneNumber) {
        const farmer = await prisma.farmer.findUnique({
          where: { phoneNumber: req.body.phoneNumber },
        });
        if (farmer) buyerId = farmer.id;
      }

      if (!buyerId) {
        throw new AppError('Authentication required or valid registered phone number must be provided', 401);
      }

      // Rejection rule: buyer must NOT specify minQuantity or maxQuantity
      if (req.body.minQuantity !== undefined || req.body.maxQuantity !== undefined) {
        throw new AppError('Buyer requests must specify a single fixed requiredQuantity, not a quantity range.', 400);
      }

      // Strip untrusted buyerId from request body to prevent ownership spoofing
      const { buyerId: _untrustedBuyerId, ...safeBody } = req.body;

      const request = await AgriBazaarService.createRequest({
        ...safeBody,
        buyerId,
      });

      res.status(201).json({
        success: true,
        message: 'Product request submitted to Agri Bazaar successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse or filter buyer requests
   */
  static async listRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, productName, buyerId, phoneNumber, district, search, page, limit } = req.query;

      const result = await AgriBazaarService.listRequests(
        {
          status: status as any,
          productName: productName as string,
          buyerId: buyerId as string,
          phoneNumber: phoneNumber as string,
          district: district as string,
          search: search as string,
          page: page ? parseInt(page as string, 10) : 1,
          limit: limit ? parseInt(limit as string, 10) : 20,
        },
        req.user?.role,
        req.user?.farmerId || req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single buyer request with status tracking
   */
  static async getRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const request = await AgriBazaarService.getRequestById(
        id,
        req.user?.role,
        req.user?.farmerId || req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a buyer product request
   */
  static async updateRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'EXPERT';
      const userId = req.user?.farmerId || req.user?.userId || '';

      const updated = await AgriBazaarService.updateRequest(id, req.body, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Product request updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a buyer product request
   */
  static async cancelRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'EXPERT';
      const userId = req.user?.farmerId || req.user?.userId || '';

      const cancelled = await AgriBazaarService.cancelRequest(id, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Product request cancelled successfully',
        data: cancelled,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ADMIN SOURCING & MATCHING
  // ==========================================

  /**
   * Admin updates request status & sourcing progress
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes, verifiedQuantity, verifiedQuality, procurementCost, finalQuotePrice } = req.body;

      const staffUserId = req.user?.userId;

      const updated = await AgriBazaarService.updateRequestStatus(
        id,
        {
          status,
          adminNotes,
          verifiedQuantity,
          verifiedQuality,
          procurementCost,
          finalQuotePrice,
        },
        staffUserId
      );

      res.status(200).json({
        success: true,
        message: 'Request status and sourcing notes updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get request status history audit trail
   */
  static async getRequestHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'EXPERT';
      const history = await AgriBazaarService.getRequestHistory(id, isAdmin);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Match candidates for a buyer request
   */
  static async findMatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const matches = await AgriBazaarService.findMatchesForRequest(id);

      res.status(200).json({
        success: true,
        data: matches,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Link a matched supplier to a request
   */
  static async createMatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: requestId } = req.params;
      const { listingId, internalNotes } = req.body;
      const adminId = req.user?.userId;

      const match = await AgriBazaarService.createMatch(requestId, listingId, adminId, internalNotes);

      res.status(201).json({
        success: true,
        message: 'Supplier matched with request',
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update match status
   */
  static async updateMatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matchId } = req.params;
      const { status, internalNotes } = req.body;

      const updated = await AgriBazaarService.updateMatchStatus(matchId, status, internalNotes);

      res.status(200).json({
        success: true,
        message: 'Match status updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
