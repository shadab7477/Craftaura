import express from 'express';
import Address from '../model/Address.js';
import {authenticate} from '../middlewares/auth.js';

const router = express.Router();

// Create new address
router.post('/', authenticate(), async (req, res) => {
    console.log(req.body);
    
  try {
    const address = new Address({
      ...req.body,
      user: req.user.id
    });
    await address.save();
    res.status(201).send(address);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Get all addresses for user
router.get('/', authenticate(), async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.send(addresses);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch addresses' });
  }
});

// Update address
router.put('/:id', authenticate(), async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!address) {
      return res.status(404).send({ message: 'Address not found' });
    }
    res.send(address);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Delete address
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!address) {
      return res.status(404).send({ message: 'Address not found' });
    }
    res.send({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to delete address' });
  }
});

export default router;