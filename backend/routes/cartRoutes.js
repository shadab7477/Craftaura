// routes/cartRoutes.js
import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/userauth.js';

const router = express.Router();

router.route('/')
  .get(authenticate, getCart)
  .post(authenticate, addToCart)
  .delete(authenticate, clearCart);

router.route('/:productId')
  .delete(authenticate, removeFromCart)
  .put(authenticate, updateCartItemQuantity);

export default router;