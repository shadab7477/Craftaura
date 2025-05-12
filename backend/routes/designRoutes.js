import express from 'express';
import { submitDesign, getDesigns } from '../controllers/designController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// POST /api/designs - Submit new design
router.post('/', upload.single('image'), submitDesign);

// GET /api/designs - Get all designs
router.get('/', getDesigns);

export default router;