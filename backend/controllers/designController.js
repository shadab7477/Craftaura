import Design from '../model/Design.js';
import path from 'path';

export const submitDesign = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { 
      firstName,
      lastName,
      email,
      country,
      countryCode,
      contactNo,
      description,
      length,
      width,
      personalization,
      personalizationLocation,
      color // Add the color field from request body
    } = req.body;

    // Create relative path for the image
    const imagePath = `/uploads/${req.file.filename}`;

    const newDesign = new Design({
      firstName,
      lastName,
      email,
      country,
      countryCode,
      contactNo,
      description,
      length: Number(length),
      width: Number(width),
      personalization,
      personalizationLocation,
      color, // Include the color in the new design
      imagePath
    });

    await newDesign.save();

    res.status(201).json({
      success: true,
      message: 'Design submitted successfully',
      data: newDesign
    });
  } catch (error) {
    console.error('Error submitting design:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit design'
    });
  }
};

export const getDesigns = async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: designs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch designs'
    });
  }
};