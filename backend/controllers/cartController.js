import Cart from '../model/Cart.js';
import Product from '../model/Product.js';

// Get user's cart
// Get user's cart - Enhanced to handle color variants
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name deliveryTime colors pricing',
      });

    if (!cart) {
      return res.status(200).json({
        cart: { products: [] },
        count: 0,
        total: 0
      });
    }

    // Process cart items with shape-matched color variants
    const processedProducts = cart.products.map(item => {
      const product = item.product;
      let selectedColor = null;
      
      if (product.colors && product.colors.length > 0) {
        // First try to find exact match for both colorCode and shape
        if (item.colors?.colorCode && item.shape) {
          selectedColor = product.colors.find(c => 
            c.colorCode === item.colors.colorCode && 
            c.shape === item.shape
          );
        }
        
        // If no exact match, find by shape only
        if (!selectedColor && item.shape) {
          selectedColor = product.colors.find(c => 
            c.shape === item.shape
          );
        }
        
        // If still no match, just take first color (or handle as you prefer)
        selectedColor = selectedColor || product.colors[0];
      }

      // Calculate pricing - simplified version
      const basePrice = item.price || 0; // Using the price already stored in cart
      const finalPrice = basePrice * item.quantity;

      // Construct response without unnecessary product details
      const responseItem = {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          deliveryTime: product.deliveryTime
        },
        quantity: item.quantity,
        size: item.size,
        shape: item.shape,
        woolType: item.woolType,
        pileHeight: item.pileHeight,
        knotDensity: item.knotDensity,
        colors: item.colors,
        selectedColor, // Only the matching color variant
        price: basePrice,
        finalPrice
      };

      return responseItem;
    });

    // Calculate totals
    const count = processedProducts.reduce((sum, item) => sum + item.quantity, 0);
    const total = processedProducts.reduce((sum, item) => sum + item.finalPrice, 0);

    res.json({
      cart: { products: processedProducts },
      count,
      total
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Add to cart
// Add to cart - always adds a new item, no merging
export const addToCart = async (req, res) => {
  try {
    
    const { productId, quantity = 1, ...customizations } = req.body;
    
console.log('Received colors:', customizations.colors);

    if (!productId || !customizations.price) {
      return res.status(400).json({ message: 'Product ID and price are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    // Create cart item structure
    const cartItem = {
      product: productId,
      quantity,
      price: parseFloat(customizations.price),
      ...customizations
    };

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        products: [cartItem]
      });
      console.log('Created new cart');
    } else {
      // Always add a new item regardless of existing entries
      cart.products.push(cartItem);
      console.log('Added new item to cart (no merge)');
    }

    // Validate before saving
    const validationError = cart.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ message: 'Validation failed', error: validationError });
    }

    // Save with error handling
    try {
      const savedCart = await cart.save();
      console.log('Cart saved successfully:', savedCart);
      
      await savedCart.populate('products.product', 'name price images stock');
      
      // Calculate count and total manually
      const count = savedCart.products.reduce((sum, item) => sum + item.quantity, 0);
      const total = savedCart.products.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return res.json({
        cart: savedCart,
        count,
        total
      });
    } catch (saveError) {
      console.error('Save error:', saveError);
      return res.status(500).json({ 
        message: 'Failed to save cart',
        error: saveError.message 
      });
    }

  } catch (error) {
    console.error('Cart error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    
    await cart.populate('products.product', 'name price images stock');

    res.json({
      cart,
      count: cart.count,
      total: cart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.products.find(item => 
      item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();
    
    await cart.populate('products.product', 'name price images stock');

    res.json({
      cart,
      count: cart.count,
      total: cart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.user._id });
    
    res.json({
      message: 'Cart cleared successfully',
      cart: { products: [] },
      count: 0,
      total: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};