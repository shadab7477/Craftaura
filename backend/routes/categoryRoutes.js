import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import upload from '../config/cloudinary.js';
import { authenticate } from '../middlewares/auth.js'; // ✅ Import middleware

const router = express.Router();

router.get('/', getCategories);

// Protect creation & deletion with auth (and optionally roles like 'admin')
router.post(
  '/',
  authenticate(['admin']), // ✅ Only allow admins to create categories
  upload.single('image'),
  createCategory
);

router.delete(
  '/:id',
  authenticate(['admin']), // ✅ Only allow admins to delete
  deleteCategory
);

export default router;
