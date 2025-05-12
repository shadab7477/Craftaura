import mongoose from 'mongoose';

const ShapesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    }
  }
}, { timestamps: true });

export default mongoose.model('Shape', ShapesSchema);
