// cartRoutes.js
import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../controllers/wishlistController.js';
import { authenticate } from '../middlewares/userauth.js';

const router = express.Router();

router.route('/')
  .post(authenticate, addToWishlist)
  .get(authenticate, getWishlist)

router.route('/:productId')
  .delete(authenticate, removeFromWishlist)

export default router;







