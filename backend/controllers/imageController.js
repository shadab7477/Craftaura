import cloudinary from 'cloudinary';
import fs from 'fs';
import { unlinkAsync } from '../utils/fileUtils.js';  // Assuming this utility is defined for unlinking files

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    const uploadResults = [];

    // Process base images
    if (req.files.baseImages) {
      for (const file of req.files.baseImages) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'rugs/products/base_images',
          });

          uploadResults.push({
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format
          });

          // Clean up the uploaded file
          await unlinkAsync(file.path);
        } catch (err) {
          console.error('Error uploading base image:', err);
        }
      }
    }

    // Process overlay images
    if (req.files.overlays) {
      for (const file of req.files.overlays) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'rugs/products/overlays',
          });

          uploadResults.push({
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format
          });

          // Clean up the uploaded file
          await unlinkAsync(file.path);
        } catch (err) {
          console.error('Error uploading overlay image:', err);
        }
      }
    }

    if (uploadResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were successfully uploaded'
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadResults.length} file(s) uploaded successfully`,
      uploadedImages: uploadResults
    });

  } catch (error) {
    console.error('Server error during upload:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: error.message
    });
  }
};
