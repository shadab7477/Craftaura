import Category from '../model/Category.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Ensure image is uploaded via Cloudinary and available in req.file
    const { file } = req;  // Access file from request object
    if (!file) {
      return res.status(400).json({ success: false, error: 'Image upload is required' });
    }

    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
      folder: 'categories', // Specify Cloudinary folder
      allowed_formats: ['jpg', 'png', 'jpeg','webp','avif'],
    });

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please include a category name' });
    }

    // Check if category exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id); // Cleanup image if category already exists
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }

    // Create the new category with image data from Cloudinary
    const category = new Category({
      name,
      image: {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url  // Use secure_url for the URL
      }
    });

    const createdCategory = await category.save();

    res.status(201).json({ success: true, data: createdCategory });
  } catch (error) {
    console.error(error);

    // Cleanup the image from Cloudinary if an error occurs
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.public_id)
        .catch(cleanupError => console.error('Image cleanup failed:', cleanupError));
    }

    res.status(500).json({ success: false, error: 'Server Error' });
  }
};



// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(category.image.public_id);

    // Delete the category from database
    await category.deleteOne();  // Use deleteOne instead of remove (remove is deprecated)

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
