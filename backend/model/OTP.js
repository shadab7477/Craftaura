import mongoose from 'mongoose';

// In your OTP model
const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '5m' } // Auto-delete after 5 minutes
});

const OTP = mongoose.model('OTP', OTPSchema);

export default OTP;