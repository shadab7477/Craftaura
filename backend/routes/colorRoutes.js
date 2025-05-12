import express from 'express';
import { getColors, createColor, deleteColor } from '../controllers/colorController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getColors);

router.post(
  '/',
  authenticate(['admin']), // Only allow admins to add colors
  createColor
);

router.delete(
  '/:id',
  authenticate(['admin']), // Only allow admins to delete
  deleteColor
);

export default router;
