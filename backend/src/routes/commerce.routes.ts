import { Router } from 'express';
import { CommerceController } from '../controllers/commerce.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/products', CommerceController.listProducts);
router.get('/cart', optionalAuth, CommerceController.getCart);
router.post('/cart/items', optionalAuth, CommerceController.addToCart);
router.post('/checkout', optionalAuth, CommerceController.checkout);
router.get('/orders', optionalAuth, CommerceController.getOrders);

export default router;
