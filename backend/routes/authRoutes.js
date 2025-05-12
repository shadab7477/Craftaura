import express from 'express';
import {
  checkEmail,
  register,
  login,
  logout,
  getCurrentUser,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  googleAuth,
  sendOTP,
  verifyOTP,
} from '../controllers/auth.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();


router.get('/me', authenticate(), getCurrentUser);


router.post('/google', googleAuth);


router.post('/check-email', checkEmail);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate(), logout);
router.put('/profile', authenticate(), updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);



router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
export default router;