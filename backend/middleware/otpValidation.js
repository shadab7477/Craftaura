import { body } from 'express-validator';

export const validateOTPRequest = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('purpose')
    .isIn(['registration', 'password_reset', 'email_verification', 'other'])
    .withMessage('Invalid OTP purpose'),
  
  body('otp')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

export const validateOTPResend = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('purpose')
    .isIn(['registration', 'password_reset', 'email_verification', 'other'])
    .withMessage('Invalid OTP purpose')
];