// models/Contact.js
import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  originalName: { type: String, required: true }
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  countryCode: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  attachments: [attachmentSchema],
  createdAt: { type: Date, default: Date.now }
});

const Bespoke = mongoose.model('Bespoke', contactSchema);

export default Bespoke;