// /utils/cloudinary.js
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,  // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,  // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET,  // Your Cloudinary API secret
});

// Utility function to upload an image to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' }, // We're uploading an image
      (error, result) => {
        if (error) reject(error);  // Reject promise on error
        else resolve(result);  // Resolve with the result (Cloudinary response)
      }
    ).end(file.buffer);  // Pass the image buffer to Cloudinary upload stream
  });
};
