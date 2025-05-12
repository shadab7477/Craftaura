import Contact from '../model/contactModel.js';

// @desc    Create a new contact submission
// @route   POST /api/contact
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { name, email, countryCode, phone, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      countryCode,
      phone,
      subject,
      message
    });

    const createdContact = await contact.save();
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will contact you soon.',
      data: createdContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

// @desc    Get all contact submissions (for admin purposes)
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};