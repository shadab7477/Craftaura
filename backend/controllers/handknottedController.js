import Handknotted from '../model/handknottedModel.js';

export const getHandknotted = async (req, res) => {
  try {
    const data = await Handknotted.find().sort({ createdAt: -1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch handknotted options' });
  }
};

export const createHandknotted = async (req, res) => {
  try {
    const { name, price } = req.body;
    const created = await Handknotted.create({ name, price });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create handknotted option' });
  }
};

export const deleteHandknotted = async (req, res) => {
  try {
    await Handknotted.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};
