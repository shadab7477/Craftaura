import mongoose from 'mongoose';

const handknottedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

const Handknotted = mongoose.model('Handknotted', handknottedSchema);
export default Handknotted;
