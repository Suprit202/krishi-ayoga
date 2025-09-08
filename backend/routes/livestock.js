const express = require('express');
const { protect } = require('../middleware/auth');
const LivestockGroup = require('../models/LivestockGroup');
const Farm = require('../models/Farm'); 

const router = express.Router();

// @desc    Get all livestock groups for user's farm
// @route   GET /api/livestock
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Only get groups for the user's farm
    const groups = await LivestockGroup.find({ farmId: req.user.farmId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get single livestock group
// @route   GET /api/livestock/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const group = await LivestockGroup.findById(req.params.id).populate('currentTreatments');
    
    if (!group) {
      return res.status(404).json({ message: 'Livestock group not found' });
    }
    
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching livestock group:', error);
    res.status(500).json({ message: 'Server error while fetching livestock group' });
  }
});

// @desc    Create new livestock group for user's farm
// @route   POST /api/livestock
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, species, count } = req.body;

    // Check if user is assigned to a farm
    if (!req.user.farmId) {
      return res.status(400).json({ message: 'User is not assigned to any farm' });
    }

    const group = await LivestockGroup.create({
      name,
      species,
      count,
      farmId: req.user.farmId // Use the user's actual farm ID
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update livestock group status (with authorization check)
// @route   PUT /api/livestock/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    // First find the group and check if it belongs to user's farm
    const group = await LivestockGroup.findOne({ 
      _id: req.params.id, 
      farmId: req.user.farmId 
    });

    if (!group) {
      return res.status(404).json({ message: 'Livestock group not found or access denied' });
    }

    // Update the status
    const updatedGroup = await LivestockGroup.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get livestock groups by farm (for admin)
// @route   GET /api/livestock/farm/:farmId
// @access  Private
router.get('/farm/:farmId', protect, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    // Check authorization - admin can access any farm, others only their own
    if (req.user.role !== 'admin' && req.user.farmId.toString() !== farmId) {
      return res.status(403).json({ message: 'Not authorized to access this farm' });
    }

    const groups = await LivestockGroup.find({ farmId });
    const farm = await Farm.findById(farmId).select('name location');

    res.json({
      farm,
      groupCount: groups.length,
      groups
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;