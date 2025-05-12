import Pattern from '../model/Pattern.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Get all patterns
// @route   GET /api/patterns
// @access  Public
export const getPatterns = async (req, res) => {
  try {
    const patterns = await Pattern.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: patterns.length,
      data: patterns
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create new pattern
// @route   POST /api/patterns
// @access  Private/Admin
export const createPattern = async (req, res) => {
  try {
    const { name } = req.body;

    // Ensure image is uploaded via Cloudinary and available in req.file
    const { file } = req;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Image upload is required' });
    }

    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
      folder: 'patterns', // Different folder for patterns
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
    });

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please include a pattern name' });
    }

    // Check if pattern exists
    const existingPattern = await Pattern.findOne({ name });
    if (existingPattern) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      return res.status(400).json({ success: false, error: 'Pattern already exists' });
    }

    // Create the new pattern with image data from Cloudinary
    const pattern = new Pattern({
      name,
      image: {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url
      }
    });

    const createdPattern = await pattern.save();

    res.status(201).json({ success: true, data: createdPattern });
  } catch (error) {
    console.error(error);

    // Cleanup the image from Cloudinary if an error occurs
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.public_id)
        .catch(cleanupError => console.error('Pattern image cleanup failed:', cleanupError));
    }

    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete pattern
// @route   DELETE /api/patterns/:id
// @access  Private/Admin
export const deletePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ success: false, error: 'Pattern not found' });
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(pattern.image.public_id);

    // Delete the pattern from database
    await pattern.deleteOne();

    res.json({ success: true, message: 'Pattern deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};