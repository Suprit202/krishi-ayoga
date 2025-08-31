// backend/routes/farms.js
const express = require('express');
const { protect } = require('../middleware/auth');
const Farm = require('../models/Farm');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all farms (for admin) or user's farm
// @route   GET /api/farms
// @access  Private
// backend/routes/farms.js - Update the get endpoint
router.get('/', protect, async (req, res) => {
  try {
    let farms;
    if (req.user.role === 'admin') {
      farms = await Farm.find();
    } else {
      // For non-admin users, only return their assigned farm
      farms = await Farm.find({ _id: req.user.farmId });
    }

    // Get users for each farm separately
    const farmsWithUsers = await Promise.all(
      farms.map(async (farm) => {
        const users = await User.find({ farmId: farm._id }).select('name email role');
        return {
          ...farm.toObject(),
          users
        };
      })
    );

    res.json(farmsWithUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create new farm
// @route   POST /api/farms
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create farms' });
    }

    const { name, location, farmType, registrationId, contactInfo } = req.body;

    const farm = await Farm.create({
      name,
      location,
      farmType,
      registrationId,
      contactInfo
    });

    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Add user to farm
// @route   PUT /api/farms/:farmId/users/:userId
// @access  Private (Admin only)
router.put('/:farmId/users/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const farm = await Farm.findById(req.params.farmId);
    const user = await User.findById(req.params.userId);

    if (!farm || !user) {
      return res.status(404).json({ message: 'Farm or user not found' });
    }

    // Remove user from previous farm if any
    if (user.farmId) {
      await Farm.findByIdAndUpdate(
        user.farmId,
        { $pull: { users: user._id } }
      );
    }

    // Update user's farm reference
    user.farmId = farm._id;
    await user.save();

    // Add user to farm's users array (avoid duplicates)
    if (!farm.users.includes(user._id)) {
      farm.users.push(user._id);
      await farm.save();
    }

    res.json({ message: `User ${user.name} added to farm ${farm.name}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;