import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import categoryRoutes from './routes/categoryRoutes.js';
import patternRoutes from "./routes/patternRoutes.js"
import shapeRoutes from './routes/shapeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import addresses from './routes/addresses.js';
import imageRoutes from "./routes/imageRoutes.js"
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

import contactRoutes from './routes/contactRoutes.js';
import BespokeRoutes from './routes/BespokeRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import pileHeightRoutes from "./routes/pileHeightRoutes.js"
import handknottedRoutes from "./routes/handknottedRoutes.js"
import userRoutes from "./routes/userRoutes.js" 
import otpRoutes from "./routes/otpRoutes.js" 

import chatbotRouter from './routes/chatbot.js';
// import uploadRoutes from './routes/uploadRoutes.js';
const app = express();

// Middleware

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import designRoutes from './routes/designRoutes.js';
app.use('/api/designs', designRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/shapes', shapeRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/otp', otpRoutes);

app.use('/api/products', productRoutes);
// app.use('/api/upload', uploadRoutes);

app.use('/api/addresses', addresses);

app.use('/api/colors', colorRoutes);


app.get('/api/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/images',imageRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use('/api/contact', contactRoutes);
app.use('/api/bespoke', BespokeRoutes);

app.use('/api/users', userRoutes);




app.use('/api/pileheights', pileHeightRoutes);


app.use("/api/handknotted" , handknottedRoutes  )

// Error handling for unsupported files
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
  next();
});


connectDB()

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});