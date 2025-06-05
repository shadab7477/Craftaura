import express from 'express';
import {
  createProduct,
  uploadProductImages,
  deleteProductImage,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  Updatelayercolor
} from '../controllers/productController.js';
import upload from '../middleware/Multiimage.js';

const router = express.Router();

// Image upload route
router.post(
    '/upload',
    (req, res, next) => {
      upload.array('images', 10)(req, res, function (err) {
     console.log("Upload me aagye");
     
        if (err) return next(err);
        console.log("behasb" );
         // Delegate to centralized error handler
        next();
      });
    },
    uploadProductImages
  );
  
  router.get('/allproducts', getAllProducts);

  router.delete("/productdelete/:id",deleteProduct)
  router.get("/productdetails/:id",getProductById)
 // In your backend route
router.put(
  '/update/:id',// Add this if you're not actually uploading files
  updateProduct
);




router.put('/update-layer-color',Updatelayercolor)


router.post('/delete-images', deleteProductImage);

// Product routes
router.post('/', createProduct);
// router.delete('/images/:publicId', deleteProductImage);

export default router;