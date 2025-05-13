
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import OTP from '../model/OTP.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import nodemailer from 'nodemailer';



export const checkEmail = async (req, res) => {
  try {
    console.log(req.body);
    
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    console.log(!!user);
    
    res.json({ exists: !!user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};






export const googleAuth = async (req, res) => {
  try {
    const { token, email, firstName, lastName, profilePic } = req.body;

    if (!token || !email || !firstName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify Google token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload['sub'];

    // Find user by Google ID or email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (user) {
      // If Google ID is not linked yet, link it now
      if (!user.googleId) {
        user.googleId = googleId;
      }

      // Update profile pic if changed
      if (profilePic && user.profilePic !== profilePic) {
        user.profilePic = profilePic;
      }
    } else {
      // Create new user
      user = new User({
        firstName,
        lastName: lastName || '',
        email,
        googleId,
        profilePic: profilePic || '',
        isVerified: true,
        isGooglelogin:true,
        countryCode: '',
        phoneNumber: ''
      });
    }

    // Update last login and save user
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send success response
    res.status(200).json({
      token: authToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isGooglelogin:user.isGooglelogin,
        role: user.role
      },
      message: 'Google authentication successful'
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, countryCode, phoneNumber } = req.body;
    console.log('Registration request body:', req.body);

    // Validate required fields (removed OTP from required fields)
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'First name, last name, email and password are required' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      countryCode: countryCode || '',
      phoneNumber: phoneNumber || '',
      isVerified: true,
      role: email.endsWith('@gmail.com') ? 'admin' : 'user'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Check if account is locked
    if (user.failedLoginAttempts >= 5 && user.lockUntil > new Date()) {
      return res.status(403).json({ 
        message: 'Account locked. Try again later.' 
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );
    // Omit sensitive data in response
    res.status(201).json(
      {
        token, 
        user: { 
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();
    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested a password reset. Click the link below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Reset Password
          </a>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.json({ 
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};
export const logout = async (req, res) => {
  // Since JWT is stateless, client should remove the token
  res.json({ message: 'Logged out successfully' });
};




export const getCurrentUser = async (req, res) => {
  try {

    console.log("user worked");
    


    // First verify the user object exists in the request
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find the user and explicitly exclude sensitive fields
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -failedLoginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      countryCode: user.countryCode,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified
    });
    
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    
    // More specific error handling
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};





export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { firstName, lastName, email, phoneNumber, password, currentPassword } = req.body;
    // Validate email change
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // In a real app, you might want to verify the new email
      user.email = email;
      user.isVerified = false; // Require verification for new email
    }
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    // Password change requires current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      user.password = password;
    }
    const updatedUser = await user.save();
    // Omit sensitive data in response
  
    res.json(
      {
        user: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          role: updatedUser.role,
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};




const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});





export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Create new OTP record
    const otpRecord = new OTP({
      email,
      otp,
    });

    await otpRecord.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p>Use the following OTP to verify your account:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #007bff;">${otp}</div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { email, otp } = req.body;

    if (!email || !otp) {
      console.log('Missing email or OTP');
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });
    console.log('Found OTP record:', otpRecord);

    if (!otpRecord) {
      console.log('No OTP record found for email:', email);
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    // Trim and compare OTPs as strings
    const receivedOTP = otp.toString().trim();
    const storedOTP = otpRecord.otp.toString().trim();
    
    console.log(`Comparing OTPs - Received: '${receivedOTP}' vs Stored: '${storedOTP}'`);

    if (receivedOTP !== storedOTP) {
      console.log('OTP mismatch');
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired (optional)
    const now = new Date();
    if (otpRecord.createdAt < new Date(now.getTime() - 5 * 60 * 1000)) { // 5 minutes expiry
      console.log('OTP expired');
      await OTP.deleteOne({ email });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // OTP is valid - delete it
    await OTP.deleteOne({ email });
    console.log('OTP deleted after successful verification');

    // Send success response with verification status
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};