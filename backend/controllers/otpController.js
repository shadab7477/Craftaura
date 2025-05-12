import OTP from '../model/OTP.js';
import User from '../model/User.js';
import { generateOTP } from '../utils/otpGenerator.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Rate limiting store
const otpRateLimits = new Map();

/**
 * @desc    Send OTP to email
 * @route   POST /api/otp/send
 * @access  Public
 */
export const sendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    // Validate input
    if (!email || !purpose) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and purpose are required' 
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Check rate limiting
    const now = Date.now();
    const rateLimitKey = `${email}_${purpose}`;
    const rateLimitInfo = otpRateLimits.get(rateLimitKey);

    if (rateLimitInfo && now - rateLimitInfo.lastSent < 60000) {
      const timeLeft = Math.ceil((60000 - (now - rateLimitInfo.lastSent)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} seconds before requesting another OTP`
      });
    }

    // Check user existence based on purpose
    const userExists = await User.findOne({ email });
    if (purpose === 'registration' && userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }
    if (purpose === 'password_reset' && !userExists) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Generate OTP and hash
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    // Create hashed OTP
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Create or update OTP record
    await OTP.findOneAndUpdate(
      { email, purpose },
      { 
        otp: otpHash,
        expiresAt: otpExpires,
        attempts: 0,
        verified: false
      },
      { upsert: true, new: true }
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'your-email@example.com',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 10px; margin: 10px 0; font-size: 24px; letter-spacing: 2px; text-align: center;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Update rate limit
    otpRateLimits.set(rateLimitKey, { lastSent: now });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Only send OTP in development for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/otp/verify
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, OTP and purpose are required' 
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, purpose });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP not found or expired' 
      });
    }

    // Check if OTP is already verified
    if (otpRecord.verified) {
      return res.status(400).json({
        success: false,
        message: 'OTP already verified'
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired' 
      });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false,
        message: 'Too many attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    if (otpHash !== otpRecord.otp) {
      // Increment attempt counter
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );
      
      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      return res.status(400).json({ 
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
        attemptsLeft: remainingAttempts
      });
    }

    // Mark OTP as verified
    await OTP.updateOne(
      { _id: otpRecord._id },
      { verified: true }
    );

    // Generate verification token (for password reset, etc.)
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verificationToken,
      verificationTokenExpires: verificationTokenExpires.toISOString()
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/otp/resend
 * @access  Public
 */
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and purpose are required' 
      });
    }

    // Delete any existing OTP for this email/purpose
    await OTP.deleteOne({ email, purpose });

    // Call sendOTP again
    req.body = { email, purpose };
    return sendOTP(req, res);
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};