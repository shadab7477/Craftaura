import express from 'express';
import {
  getPatterns,
  createPattern,
  deletePattern
} from '../controllers/patternController.js';
import upload from '../config/cloudinary.js';
import { authenticate } from '../middlewares/auth.js'; // ✅ Import auth middleware

const router = express.Router();

// ✅ Public route - anyone can view patterns
router.get('/', getPatterns);

// ✅ Admin-only routes for create and delete
router.post(
  '/',
  authenticate(['admin']), // protect this route
  upload.single('image'),
  createPattern
);

router.delete(
  '/:id',
  authenticate(['admin']), // protect this route
  deletePattern
);

export default router;
