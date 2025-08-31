const express = require('express');
const { protect } = require('../middleware/auth');
const LivestockGroup = require('../models/LivestockGroup');

const router = express.Router();

// @desc    Get all livestock groups
// @route   GET /api/livestock
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const groups = await LivestockGroup.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create new livestock group
// @route   POST /api/livestock
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, species, count } = req.body;

    // For now, we'll hardcode farmId. Later we'll link to user's farm
    const farmId = '65d0a1b2c8e9f4a4c8f3b2a1'; // Example farm ID

    const group = await LivestockGroup.create({
      name,
      species,
      count,
      farmId
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update livestock group status
// @route   PUT /api/livestock/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const group = await LivestockGroup.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;