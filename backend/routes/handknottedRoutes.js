import express from 'express';
import {
  getHandknotted,
  createHandknotted,
  deleteHandknotted,
} from '../controllers/handknottedController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getHandknotted);
router.post('/', authenticate(['admin']), createHandknotted);
router.delete('/:id', authenticate(['admin']), deleteHandknotted);

export default router;
