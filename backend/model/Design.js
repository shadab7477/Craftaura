import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: { type: String, required: true },
  contactNo: { type: String, required: true },
  description: { type: String, required: true },
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  color: { type: String },
  personalization: { type: String },
  personalizationLocation: { 
    type: String,
    enum: ['corner', 'border', 'center'],
    default: 'corner'
  },
  imagePath: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Design', designSchema);