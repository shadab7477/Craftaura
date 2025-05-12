import mongoose from 'mongoose';

const pileHeightSchema = new mongoose.Schema(
  {
    height: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

const PileHeight = mongoose.model('PileHeight', pileHeightSchema);
export default PileHeight;
