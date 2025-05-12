import express from 'express';
import { sendOTP, verifyOTP, resendOTP } from '../controllers/otpController.js';
import { validateOTPRequest } from '../middleware/otpValidation.js';

const router = express.Router();

router.post('/send', validateOTPRequest, sendOTP);
router.post('/verify', validateOTPRequest, verifyOTP);
router.post('/resend', validateOTPRequest, resendOTP);

export default router;