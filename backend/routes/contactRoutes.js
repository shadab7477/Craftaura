import express from 'express';
import { createContact, getContacts } from '../controllers/contactController.js';
import { authenticate } from '../middlewares/auth.js'; // ✅ Import auth middleware

const router = express.Router();

// Public route to create a contact (e.g. from a contact form)
router.post('/', createContact);

// Admin-only route to view all contact submissions
router.get('/', authenticate(['admin']), getContacts); // ✅ Protected with role
// If you just want logged-in users: use authenticate() instead

export default router;
