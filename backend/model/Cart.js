import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    area: Number,
    originalArea: Number,
    originalUnit: String,
    width: Number,
    length: Number
  },
  woolType: {
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  shape: {
    name: String,
    class: String,
    icon: String
  },
  pileHeight: {
    range: String,
    price: Number
  },
  knotDensity: {
    count: String,
    price: Number
  },
  colors: {
    type: Map,
    of: String
  },
  materials: [String],
  price: {
    type: Number,
    required: true
  }
}, { _id: true }); // Each item gets its own ID

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  products: [cartItemSchema]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total price calculation
cartSchema.virtual('total').get(function() {
  return this.products.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for total item count
cartSchema.virtual('count').get(function() {
  return this.products.reduce((count, item) => count + item.quantity, 0);
});

const Cart = mongoose.model('Ucart', cartSchema);
export default Cart;