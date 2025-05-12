import mongoose from "mongoose";

const carpetDesignSchema = new mongoose.Schema({
  carpet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carpet',
    required: true
  },
  baseImage: {
    type: String,
    required: [true, 'Base image is required']
  },
  layeredImage: {
    type: String,
    required: [true, 'Layered image is required']
  },
  angleImages: [{
    url: String,
    angle: {
      type: String,
      enum: ['front', 'top', 'side', 'detail', 'closeup']
    },
    thumbnail: String
  }],
  colorOptions: [{
    name: String,
    hexCode: {
      type: String,
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: props => `${props.value} is not a valid hex color code!`
      }
    },
    isDefault: Boolean
  }],
  patternMasks: [{
    name: String,
    maskImage: String,
    editable: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const CarpetDesign = mongoose.model('CarpetDesign', carpetDesignSchema);
export default CarpetDesign

