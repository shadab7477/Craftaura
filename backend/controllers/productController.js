import Product from '../model/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

// Helper function to process image uploads
const processImageUploads = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadResults = [];
  
  for (const file of files) {
    try {
      if (!fs.existsSync(file.path)) {
        console.warn(`File not found: ${file.path}`);
        continue;
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'rugs/products',
      });

      uploadResults.push({
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format
      });

      await unlinkAsync(file.path);
    } catch (fileError) {
      console.error(`Error processing file ${file.originalname}:`, fileError);
      if (fs.existsSync(file.path)) {
        await unlinkAsync(file.path).catch(console.error);
      }
    }
  }

  return uploadResults;
};

// Helper function to delete images from Cloudinary
const deleteImages = async (images) => {
  if (!images || images.length === 0) return;
  console.log("best");
  
  await Promise.all(
    images.map(img => 
      cloudinary.uploader.destroy(img.public_id).catch(console.error)
  ))
};

// Upload images to Cloudinary
export const uploadProductImages = async (req, res) => {
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files were uploaded' 
      });
    }
console.log("Chal toh rhe h");

    const uploadResults = await processImageUploads(req.files);

    if (uploadResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were successfully processed'
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

// Delete image from Cloudinary
export const deleteProductImage = async (req, res) => {
  try {
console.log("kya haal londe");
const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// Create product

export const createProduct = async (req, res) => {
  try {
    const {
      name, description, rugType, shape,
      category, pileHeight, material, pileWeight,
      deliveryTime, knotdensity, pricing, colors
    } = req.body;

    // Validate required fields
    if (!name || !description || !rugType || !shape || 
        !category || !pileHeight || !material || !pileWeight || 
        !deliveryTime || !knotdensity || !pricing || !colors) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate colors array
    if (!Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one color variant is required'
      });
    }

    // Validate each color variant
    for (const [index, color] of colors.entries()) {
      if (!color.name || !color.colorCode || !color.shape) {
        return res.status(400).json({
          success: false,
          message: `Color at index ${index} must have name, colorCode, and shape`
        });
      }

      // Validate base images
      if (!Array.isArray(color.baseImages) || color.baseImages.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Color "${color.name}" must have at least one base image`
        });
      }

      // Validate base image structure
      for (const [imgIndex, img] of color.baseImages.entries()) {
        if (!img.public_id || !img.url) {
          return res.status(400).json({
            success: false,
            message: `Base image ${imgIndex} for color "${color.name}" must have public_id and url`
          });
        }
      }

      // Validate at least one main image
      const hasMainImage = color.baseImages.some(img => img.isMain);
      if (!hasMainImage) {
        return res.status(400).json({
          success: false,
          message: `Color "${color.name}" must have one main base image`
        });
      }

      // Validate layer images if present
      if (color.layerImages && color.layerImages.length > 0) {
        for (const [layerIndex, layerImg] of color.layerImages.entries()) {
          if (!layerImg.public_id || !layerImg.url || 
              !layerImg.colorCode || layerImg.colorVariantId === undefined) {
            return res.status(400).json({
              success: false,
              message: `Layer image ${layerIndex} for color "${color.name}" is invalid`
            });
          }
        }
      }
    }

    // Create the product
    const product = new Product({
      name,
      description,
      rugType: Array.isArray(rugType) ? rugType : [rugType],
      shape: Array.isArray(shape) ? shape : [shape],
      category: Array.isArray(category) ? category : [category],
      deliveryTime,
      pricing,
      colors: colors.map(color => ({
        name: color.name,
        colorCode: color.colorCode,
        shape: color.shape,
        baseImages: color.baseImages.map(img => ({
          public_id: img.public_id,
          url: img.url,
          isMain: img.isMain
        })),
        layerImages: color.layerImages ? color.layerImages.map(layer => ({
          public_id: layer.public_id,
          url: layer.url,
          colorCode: layer.colorCode,
          colorVariantId: layer.colorVariantId,
          isMain: layer.isMain
        })) : []
      }))
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);

    // Cleanup uploaded images if product creation fails
    if (req.body.colors) {
      try {
        await Promise.all(
          req.body.colors.flatMap(color => {
            const allImages = [...(color.baseImages || []), ...(color.layerImages || [])];
            return allImages.map(img => 
              img.public_id ? cloudinary.uploader.destroy(img.public_id) : Promise.resolve()
            );
          })
        );
      } catch (cleanupError) {
        console.error('Image cleanup failed:', cleanupError);
      }
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Get all products with filtering and pagination
// Backend controller for getting all products with filters
export const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      pattern, 
      material, 
      size, 
      sort,
      shape,
      search
    } = req.query;

    // Build the query object
    const query = {};

    // Shape filter
    if (shape) {
      query.shape = shape.toLowerCase();
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { pattern: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter (array if multiple categories)
    if (category) {
      const categories = category.split(',')
        .map(cat => cat.trim())
        .filter(cat => cat);
      query.category = { $in: categories };
    }

    // Pattern filter (array if multiple patterns)
    if (pattern) {
      const patterns = pattern.split(',')
        .map(p => p.trim())
        .filter(p => p);
      query.pattern = { $in: patterns };
    }

    // Material filter (array if multiple materials)
    if (material) {
      const materials = material.split(',')
        .map(m => m.trim())
        .filter(m => m);
      query.materials = { $in: materials };
    }

    // Size filter (array if multiple sizes)
    if (size) {
      const sizes = size.split(',')
        .map(s => s.trim())
        .filter(s => s);
      query.sizes = { $in: sizes };
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // Default sort by newest
    
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'popularity':
          sortOption = { popularity: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sortOption);

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalProducts: count
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Update product
// Update product
// Update product
// Update product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Process file uploads if any
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await processImageUploads(req.files);
    }

    const {
      name, description, rate, material, pileWeight,
      deliveryTime, rugType, category, pileHeight,
      knotdensity, shape, colors
    } = req.body;

    // Parse stringified arrays if needed
    const parseArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value.split(',');
        }
      }
      return [value].filter(Boolean);
    };

    // Basic field updates
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (rate !== undefined) product.rate = rate;
    if (material !== undefined) product.material = material;
    if (pileWeight !== undefined) product.pileWeight = pileWeight;
    if (deliveryTime !== undefined) product.deliveryTime = deliveryTime;

    // Array fields
    if (rugType !== undefined) product.rugType = parseArray(rugType);
    if (category !== undefined) product.category = parseArray(category);
    if (pileHeight !== undefined) product.pileHeight = parseArray(pileHeight);
    if (knotdensity !== undefined) product.knotdensity = parseArray(knotdensity);
    if (shape !== undefined) product.shape = parseArray(shape);

    // Handle colors
    if (colors && Array.isArray(colors)) {
      const colorsToKeep = colors.filter(c => c._id);
      const colorIdsToKeep = colorsToKeep.map(c => c._id);
      const colorsToDelete = product.colors.filter(
        c => !colorIdsToKeep.includes(c._id.toString())
      );

      // Delete removed images
      for (const color of colorsToDelete) {
        if (Array.isArray(color.baseImages)) {
          await deleteImages(color.baseImages);
        }
        if (Array.isArray(color.layerImages)) {
          await deleteImages(color.layerImages);
        }
      }

      const updatedColors = [];

      for (const colorData of colors) {
        if (!colorData.name || !colorData.colorCode || !colorData.shape) {
          continue;
        }

        if (colorData._id) {
          // Update existing color
          const existingColor = product.colors.id(colorData._id);
          if (existingColor) {
            existingColor.name = colorData.name;
            existingColor.colorCode = colorData.colorCode;
            existingColor.shape = colorData.shape;

            // Process base images
            if (colorData.baseImages) {
              const baseImages = Array.isArray(colorData.baseImages) ? 
                colorData.baseImages : [colorData.baseImages];
              
              // Merge existing and new base images
              existingColor.baseImages = [
                ...existingColor.baseImages.filter(img => 
                  baseImages.some(newImg => newImg.public_id === img.public_id)
                ),
                ...baseImages.filter(img => 
                  !existingColor.baseImages.some(existing => existing.public_id === img.public_id)
                )
              ];
            }

            // Process layer images
            if (colorData.layerImages) {
              const layerImages = Array.isArray(colorData.layerImages) ? 
                colorData.layerImages : [colorData.layerImages];
              
              existingColor.layerImages = [
                ...existingColor.layerImages.filter(img => 
                  layerImages.some(newImg => newImg.public_id === img.public_id)
                ),
                ...layerImages.filter(img => 
                  !existingColor.layerImages.some(existing => existing.public_id === img.public_id)
                )
              ];
            }

            updatedColors.push(existingColor);
          }
        } else {
          // New color variant
          const newColor = {
            name: colorData.name,
            colorCode: colorData.colorCode,
            shape: colorData.shape,
            baseImages: [],
            layerImages: []
          };

          // Add base images
          if (colorData.baseImages) {
            const baseImages = Array.isArray(colorData.baseImages) ? 
              colorData.baseImages : [colorData.baseImages];
            
            newColor.baseImages = baseImages.map(img => ({
              public_id: img.public_id || img.publicId || img.publicID,
              url: img.url,
              isMain: img.isMain || false
            }));
          }

          // Add layer images
          if (colorData.layerImages) {
            const layerImages = Array.isArray(colorData.layerImages) ? 
              colorData.layerImages : [colorData.layerImages];
            
            newColor.layerImages = layerImages.map(img => ({
              public_id: img.public_id || img.publicId || img.publicID,
              url: img.url,
              colorCode: img.colorCode,
              colorVariantId: img.colorVariantId,
              isMain: img.isMain || false
            }));
          }

          updatedColors.push(newColor);
        }
      }

      if (updatedColors.length > 0) {
        product.colors = updatedColors;
      }
    }

    // Save the product
    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};


// Delete product
export const deleteProduct = async (req, res) => {
  try {
    console.log("best one");
    console.log(req.params.id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all images from Cloudinary
    for (const color of product.colors) {
      await deleteImages([...color.baseImages, ...color.layerImages]);
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};