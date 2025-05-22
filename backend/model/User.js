import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, },
  lastName: { type: String, },
  email: { type: String,  unique: true },
  countryCode: { type: String, },
  phoneNumber: { type: String, },
  password: { type: String, },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isGooglelogin: {
    type: Boolean,
    default: false,
  },

  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },


    resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }




});

export default mongoose.model('User', userSchema);