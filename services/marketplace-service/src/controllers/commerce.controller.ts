import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CommerceService } from '../services/commerce.service.js';

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  quantity: z.number().int().positive().default(1),
});

const checkoutSchema = z.object({
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'UPI', 'RAZORPAY']).default('CASH_ON_DELIVERY'),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string().min(1),
    village: z.string().min(1),
    district: z.string().min(1),
    state: z.string().min(1),
  }),
  notes: z.string().optional(),
});

export class CommerceController {
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, category, limit } = req.query;
      const products = await CommerceService.getProducts({
        query: query ? String(query) : undefined,
        category: category ? String(category) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });

      res.status(200).json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = (req as any).user?.id || (req as any).user?.uid || 'guest';
      const cart = await CommerceService.getCart(farmerId);
      res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = (req as any).user?.id || (req as any).user?.uid || 'guest';
      const parsed = addToCartSchema.parse(req.body);

      const item = await CommerceService.addToCart({
        farmerId,
        productId: parsed.productId,
        quantity: parsed.quantity,
      });

      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = (req as any).user?.id || (req as any).user?.uid || 'guest';
      const parsed = checkoutSchema.parse(req.body);

      const order = await CommerceService.checkout({
        farmerId,
        paymentMethod: parsed.paymentMethod,
        shippingAddress: parsed.shippingAddress,
        notes: parsed.notes,
      });

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = (req as any).user?.id || (req as any).user?.uid || 'guest';
      const orders = await CommerceService.getOrders(farmerId);
      res.status(200).json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }
}
