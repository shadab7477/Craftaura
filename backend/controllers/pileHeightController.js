import PileHeight from '../model/PileHeight.js';

export const getPileHeights = async (req, res) => {
  try {
    const data = await PileHeight.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPileHeight = async (req, res) => {
  try {
    const { height, price } = req.body;
    if (!height || !price) return res.status(400).json({ message: 'All fields required' });

    const newEntry = new PileHeight({ height, price });
    await newEntry.save();
    res.status(201).json({ success: true, message: 'Pile height added', data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePileHeight = async (req, res) => {
  try {
    const { id } = req.params;
    await PileHeight.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
