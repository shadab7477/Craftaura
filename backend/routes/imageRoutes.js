import express from 'express';
import { uploadProductImages } from '../controllers/imageController.js';
import upload from '../middleware/Multiimage.js';

const router = express.Router();

// Handle multiple base image and overlay uploads
router.post(
  '/upload',
  upload.fields([  // Correct usage of the middleware
    { name: 'baseImages', maxCount: 5 },  // Upload up to 5 base images
    { name: 'overlays', maxCount: 20 },   // Upload up to 10 overlays
  ]),
  uploadProductImages  // After the upload middleware, call the controller
);

export default router;
