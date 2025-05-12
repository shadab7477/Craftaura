import express from 'express';
import {
  getPileHeights,
  createPileHeight,
  deletePileHeight
} from '../controllers/pileHeightController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getPileHeights);
router.post('/',
    authenticate(['admin']), createPileHeight);
router.delete('/:id',
    authenticate(['admin']), deletePileHeight);

export default router;
