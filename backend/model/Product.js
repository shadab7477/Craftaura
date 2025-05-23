import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shape: [{ type: String, required: true }],
  category: [{ type: String, required: true }],
  deliveryTime: { type: String, required: true },
  rugType: [{ type: String, required: true }],

  pricing: {
    woolTypes: [
      {
        type: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    knotDensity: {
      type: Map,
      of: Number,
      default: {}
    },
    pileHeight: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  colors: [
    {
      name: { type: String, required: true },
      colorCode: { type: String, required: true },
      shape: { type: String, required: true },
      baseImages: [
        {
          public_id: { type: String, required: true },
          url: { type: String, required: true },
          isMain: { type: Boolean, default: false }
        }
      ],
      layerImages: [
        {
          public_id: { type: String, required: true },
          url: { type: String, required: true },
          colorCode: { type: String, required: true },
          colorVariantId: { type: Number, required: true },
          isMain: { type: Boolean, default: false }
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'colors.colorCode': 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;