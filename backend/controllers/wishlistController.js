import Wishlist from '../model/Wishlist.js'; // Assuming you have a Wishlist model
import Product from '../model/Product.js'; // Assuming you need to check valid products

// Add to wishlist
export const addToWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({ message: 'Product already in wishlist', count: wishlist.products.length });
      }
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.status(200).json({
      message: 'Added to wishlist',
      wishlist,
      count: wishlist.products.length,
    });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get wishlist
export const getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    res.status(200).json({
      wishlist: wishlist || { products: [] },
      count: wishlist ? wishlist.products.length : 0,
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productId
    );

    await wishlist.save();
    res.status(200).json({
      message: 'Removed from wishlist',
      wishlist,
      count: wishlist.products.length,
    });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

