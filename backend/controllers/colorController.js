import Color from '../model/colorModel.js';

// Get all colors
export const getColors = async (req, res) => {
  try {
    const colors = await Color.find().sort({ createdAt: -1 });
    res.json({ data: colors });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching colors' });
  }
};

// Create a new color
export const createColor = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Color code is required' });

  try {
    const newColor = new Color({ code });
    await newColor.save();
    res.status(201).json({ message: 'Color added', data: newColor });
  } catch (err) {
    res.status(500).json({ message: 'Error saving color' });
  }
};

// Delete a color
export const deleteColor = async (req, res) => {
  try {
    await Color.findByIdAndDelete(req.params.id);
    res.json({ message: 'Color deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting color' });
  }
};
