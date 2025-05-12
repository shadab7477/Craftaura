
import mongoose from "mongoose";
const carpetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  rate: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  rugType: [{
    type: String,
    enum: ['Handmade', 'Machine Made', 'Hand-Knotted', 'Tufted', 'Flatweave'],
    required: true
  }],
  shape: [{
    type: String,
    enum: ['Rectangle', 'Round', 'Square', 'Runner', 'Oval'],
    required: true
  }],
  category: [{
    type: String,
    enum: ['Traditional', 'Modern', 'Vintage', 'Bohemian', 'Geometric'],
    required: true
  }],
  pileHeight: [{
    type: String,
    enum: ['Low (0-0.5")', 'Medium (0.5-1")', 'High (1-2")', 'Extra High (2"+)"'],
    required: true
  }],
  material: {
    type: String,
    required: [true, 'Material is required'],
    enum: ['Wool', 'Silk', 'Cotton', 'Jute', 'Synthetic', 'Blend']
  },
  pileWeight: {
    type: String,
    required: [true, 'Pile weight is required']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required']
  },
  knotDensity: [{
    type: String,
    enum: ['100 KPSI', '150 KPSI', '200 KPSI', '250 KPSI', '300 KPSI'],
    required: true
  }],
  availableSizes: [{
    dimensions: String,
    price: Number,
    sku: String
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from name before saving
carpetSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  next();
});

const Carpet = mongoose.model('Carpet', carpetSchema);
export default Carpet