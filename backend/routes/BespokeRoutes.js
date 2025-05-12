// routes/contactRoutes.js
import express from 'express';
import { submitContactForm } from '../controllers/bespokeController.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.post('/', upload.array('files', 5), submitContactForm);

export default router;