// /middleware/upload.js
import multer from 'multer';

// Configure Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
