import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Color', colorSchema);
