import express from 'express';
import {
  getShapes,
  createShape,
  deleteShape
} from '../controllers/shapeController.js';
import upload from '../config/cloudinary.js';
import { authenticate } from '../middlewares/auth.js';
const router = express.Router();

// Public routes
router.get('/', getShapes);

// Protected admin routes
router.post('/',
  authenticate(['admin']),  upload.single('image'), createShape);
router.delete('/:id', 
  authenticate(['admin']), deleteShape);

export default router;