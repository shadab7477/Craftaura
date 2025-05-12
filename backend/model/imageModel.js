// /models/imageModel.js
import mongoose from 'mongoose';

// Define a schema for storing image URLs
const imageSchema = new mongoose.Schema({
  baseImages: [String],  // Array of base image URLs
  overlays: [String],    // Array of overlay image URLs
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
