// routes/farm.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');

// @desc    Get farm profile
// @route   GET /api/farm/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let farmDetails = null;
    if (user.farmId) {
      farmDetails = await Farm.findById(user.farmId);
    }

    res.json({
      farm: farmDetails || user.farm, // Use Farm document if exists, else use embedded farm data
      farmer: {
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update farm profile
// @route   PUT /api/farm/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      contact,
      size,
      establishedYear,
      registrationId,
      description,
      phone,
      address,
      experience,
      qualifications,
      specialization
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update or create Farm document
    let farm;
    if (user.farmId) {
      // Update existing farm
      farm = await Farm.findByIdAndUpdate(
        user.farmId,
        {
          name,
          type,
          location,
          contact,
          size,
          establishedYear,
          registrationId,
          description
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new farm
      farm = await Farm.create({
        name,
        type,
        location,
        contact,
        size,
        establishedYear,
        registrationId,
        description,
        owner: req.user.id
      });
    }

    // Update user profile
    const updateData = {};
    if (phone) updateData['profile.phone'] = phone;
    if (address) updateData['profile.address'] = address;
    if (experience) updateData['profile.experience'] = experience;
    if (qualifications) updateData['profile.qualifications'] = qualifications;
    if (specialization) updateData['profile.specialization'] = specialization;

    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(req.user.id, updateData);
    }

    // Refresh user data
    const updatedUser = await User.findById(req.user.id);

    res.json({
      message: 'Profile updated successfully',
      farm: farm,
      farmer: {
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get farm statistics
// @route   GET /api/farm/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.farmId) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const farm = await Farm.findById(user.farmId);
    
    // You can add more statistics here based on your other models
    res.json({
      farmName: farm.name,
      totalAnimals: farm.totalAnimals || 0,
      establishedYear: farm.establishedYear,
      farmSize: farm.size,
      farmType: farm.type
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;