// controllers/contactController.js
import { v2 as cloudinary } from 'cloudinary';
import Bespoke from '../model/Bespoke.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, countryCode, phone, subject, message } = req.body;
    
    // Process uploaded files
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'contact_uploads',
          allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'webp', 'avif']
        });
        uploadedFiles.push({
          public_id: result.public_id,
          url: result.secure_url,
          originalName: file.originalname
        });
      }
    }

    // Create new contact entry
    const newContact = new Bespoke({
      name,
      email,
      countryCode,
      phone,
      subject,
      message,
      attachments: uploadedFiles
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will contact you soon.',
      data: savedContact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    // Cleanup any uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id)
            .catch(cleanupError => console.error('Cleanup failed:', cleanupError));
        }
      }
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};