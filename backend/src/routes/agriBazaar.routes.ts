import { Router } from 'express';
import { z } from 'zod';
import { AgriBazaarController } from '../controllers/agriBazaar.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

import { isValidQuantityUnit, isValidPriceUnit } from '../services/agriBazaar.service.js';

// Validation Schemas
const createListingSchema = z.object({
  body: z
    .object({
      productName: z.string().optional(),
      variety: z.string().optional(),
      minQuantity: z.number().positive('Minimum quantity must be greater than zero').optional(),
      maxQuantity: z.number().positive('Maximum quantity must be greater than zero').optional(),
      quantityUnit: z.string().optional(),
      price: z.number().nonnegative('Price must be a non-negative number').optional(),
      priceUnit: z.string().optional(),
      locationType: z.enum(['CURRENT', 'MANUAL']).optional(),
      locationName: z.string().optional(),
      village: z.string().optional(),
      mandal: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      photos: z.array(z.string()).optional(),
      notes: z.string().optional(),
      phoneNumber: z.string().optional(),
      sellerId: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.minQuantity !== undefined && data.maxQuantity !== undefined) {
          return data.minQuantity <= data.maxQuantity;
        }
        return true;
      },
      {
        message: 'Minimum quantity cannot exceed maximum quantity',
        path: ['minQuantity'],
      }
    )
    .refine(
      (data) => {
        if (data.quantityUnit && !isValidQuantityUnit(data.quantityUnit)) {
          return false;
        }
        return true;
      },
      {
        message: 'Unsupported quantity unit',
        path: ['quantityUnit'],
      }
    )
    .refine(
      (data) => {
        if (data.priceUnit && !isValidPriceUnit(data.priceUnit)) {
          return false;
        }
        return true;
      },
      {
        message: 'Unsupported price unit',
        path: ['priceUnit'],
      }
    )
    .refine(
      (data) => {
        return Boolean(
          data.locationName ||
            data.village ||
            data.mandal ||
            data.district ||
            data.state ||
            (data.latitude !== undefined && data.longitude !== undefined)
        );
      },
      {
        message: 'Location details or coordinates are required',
        path: ['locationName'],
      }
    ),
});

const createRequestSchema = z.object({
  body: z
    .object({
      productName: z.string().min(1, 'Product name is required'),
      variety: z.string().optional(),
      requiredQuantity: z.number().positive('Required quantity must be a positive number'),
      quantityUnit: z.string().min(1, 'Quantity unit is required'),
      expectedPrice: z.number().nonnegative().optional(),
      priceUnit: z.string().optional(),
      locationType: z.enum(['CURRENT', 'MANUAL']).optional(),
      locationName: z.string().optional(),
      village: z.string().optional(),
      mandal: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      photos: z.array(z.string()).optional(),
      phoneNumber: z.string().optional(),
      buyerId: z.string().optional(),
      minQuantity: z.never({ invalid_type_error: 'minQuantity is not allowed on buyer requests' }).optional(),
      maxQuantity: z.never({ invalid_type_error: 'maxQuantity is not allowed on buyer requests' }).optional(),
    })
    .refine(
      (data) => {
        return isValidQuantityUnit(data.quantityUnit);
      },
      {
        message: 'Unsupported quantity unit',
        path: ['quantityUnit'],
      }
    )
    .refine(
      (data) => {
        if (data.expectedPrice !== undefined && data.expectedPrice !== null && !data.priceUnit) {
          return false;
        }
        return true;
      },
      {
        message: 'Price unit is required when expected price is supplied',
        path: ['priceUnit'],
      }
    )
    .refine(
      (data) => {
        if (data.priceUnit && !isValidPriceUnit(data.priceUnit)) {
          return false;
        }
        return true;
      },
      {
        message: 'Unsupported price unit',
        path: ['priceUnit'],
      }
    )
    .refine(
      (data) => {
        return Boolean(
          data.locationName ||
            data.village ||
            data.mandal ||
            data.district ||
            data.state ||
            (data.latitude !== undefined && data.longitude !== undefined)
        );
      },
      {
        message: 'Delivery location details or coordinates are required',
        path: ['locationName'],
      }
    ),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'SUBMITTED',
      'UNDER_REVIEW',
      'SOURCING_IN_PROGRESS',
      'SUPPLIER_IDENTIFIED',
      'VERIFICATION_IN_PROGRESS',
      'PROCUREMENT_IN_PROGRESS',
      'DELIVERY_IN_PROGRESS',
      'DELIVERED',
      'CANCELLED',
    ]),
    adminNotes: z.string().optional(),
    verifiedQuantity: z.number().positive().optional(),
    verifiedQuality: z.string().optional(),
    procurementCost: z.number().nonnegative().optional(),
    finalQuotePrice: z.number().nonnegative().optional(),
  }),
});

const matchSupplierSchema = z.object({
  body: z.object({
    listingId: z.string().uuid('Valid listing ID required'),
    internalNotes: z.string().optional(),
  }),
});

// ==========================================
// SELLER LISTINGS ENDPOINTS
// ==========================================

// Seller registers a product
router.post(
  '/listings',
  optionalAuth,
  validateRequest(createListingSchema),
  AgriBazaarController.createListing
);

// Browse seller listings (privacy-masked for public)
router.get(
  '/listings',
  optionalAuth,
  AgriBazaarController.listListings
);

// Get single listing details
router.get(
  '/listings/:id',
  optionalAuth,
  AgriBazaarController.getListing
);

// Update seller listing
router.put(
  '/listings/:id',
  optionalAuth,
  AgriBazaarController.updateListing
);

// Delete seller listing
router.delete(
  '/listings/:id',
  optionalAuth,
  AgriBazaarController.deleteListing
);

// ==========================================
// BUYER PRODUCT REQUESTS ENDPOINTS
// ==========================================

// Buyer submits a product request
router.post(
  '/requests',
  optionalAuth,
  validateRequest(createRequestSchema),
  AgriBazaarController.createRequest
);

// List/browse product requests
router.get(
  '/requests',
  optionalAuth,
  AgriBazaarController.listRequests
);

// Get single product request tracking details
router.get(
  '/requests/:id',
  optionalAuth,
  AgriBazaarController.getRequest
);

// Get request status audit history
router.get(
  '/requests/:id/history',
  optionalAuth,
  AgriBazaarController.getRequestHistory
);

// Update buyer product request
router.put(
  '/requests/:id',
  optionalAuth,
  AgriBazaarController.updateRequest
);
router.patch(
  '/requests/:id',
  optionalAuth,
  AgriBazaarController.updateRequest
);

// Cancel buyer product request
router.delete(
  '/requests/:id',
  optionalAuth,
  AgriBazaarController.cancelRequest
);

// ==========================================
// ADMIN SOURCING & COORDINATION ENDPOINTS
// ==========================================

// Update request status & internal sourcing notes
router.patch(
  '/requests/:id/status',
  requireAuth,
  requireRole('ADMIN', 'EXPERT'),
  validateRequest(updateStatusSchema),
  AgriBazaarController.updateStatus
);

// Find matching suppliers for a buyer request
router.get(
  '/requests/:id/matches',
  requireAuth,
  requireRole('ADMIN', 'EXPERT'),
  AgriBazaarController.findMatches
);

// Link a supplier listing to a buyer request
router.post(
  '/requests/:id/match',
  requireAuth,
  requireRole('ADMIN', 'EXPERT'),
  validateRequest(matchSupplierSchema),
  AgriBazaarController.createMatch
);

// Update match progress status
router.patch(
  '/matches/:matchId',
  requireAuth,
  requireRole('ADMIN', 'EXPERT'),
  AgriBazaarController.updateMatch
);

export default router;
