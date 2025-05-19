// routes/chatbot.js
import express from 'express';
import { generateResponse } from '../controllers/chatbot.js';

const router = express.Router();

router.post('/', generateResponse);

export default router;