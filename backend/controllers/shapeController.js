import Shape from '../model/Shapes.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Get all shapes
// @route   GET /api/shapes
// @access  Public
export const getShapes = async (req, res) => {
  try {
    const shapes = await Shape.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: shapes.length,
      data: shapes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create new shape
// @route   POST /api/shapes
// @access  Private/Admin
export const createShape = async (req, res) => {
  try {
    const { name } = req.body;

    // Ensure image is uploaded via Cloudinary and available in req.file
    const { file } = req;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Image upload is required' });
    }

    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
      folder: 'shapes', // Different folder for shapes
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
    });

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please include a shape name' });
    }

    // Check if shape exists
    const existingShape = await Shape.findOne({ name });
    if (existingShape) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      return res.status(400).json({ success: false, error: 'Shape already exists' });
    }

    // Create the new shape with image data from Cloudinary
    const shape = new Shape({
      name,
      image: {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url
      }
    });

    const createdShape = await shape.save();

    res.status(201).json({ success: true, data: createdShape });
  } catch (error) {
    console.error(error);

    // Cleanup the image from Cloudinary if an error occurs
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.public_id)
        .catch(cleanupError => console.error('Shape image cleanup failed:', cleanupError));
    }

    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete shape
// @route   DELETE /api/shapes/:id
// @access  Private/Admin
export const deleteShape = async (req, res) => {
  try {
    const shape = await Shape.findById(req.params.id);

    if (!shape) {
      return res.status(404).json({ success: false, error: 'Shape not found' });
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(shape.image.public_id);

    // Delete the shape from database
    await shape.deleteOne();

    res.json({ success: true, message: 'Shape deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};