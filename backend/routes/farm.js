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
// routes/farm.js - UPDATED to handle admin fields
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
      specialization,
      department,    // Admin-specific field
      position       // Admin-specific field
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update or create Farm document (only for farmers)
    let farm = null;
    if (user.role === 'farmer') {
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
        // Create new farm (only for farmers)
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
    }

    // Update user profile with common fields
    const updateData = {};
    if (phone) updateData['profile.phone'] = phone;
    if (address) updateData['profile.address'] = address;
    if (experience) updateData['profile.experience'] = experience;
    if (qualifications) updateData['profile.qualifications'] = qualifications;
    if (specialization) updateData['profile.specialization'] = specialization;
    
    // Add admin-specific fields if user is admin
    if (user.role === 'admin') {
      if (department) updateData['profile.department'] = department;
      if (position) updateData['profile.position'] = position;
    }

    // Add veterinarian-specific fields if user is veterinarian
    if (user.role === 'veterinarian') {
      // You can add vet-specific fields here if needed
    }

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
        role: updatedUser.role,
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

// routes/farm.js - UPDATED FOR BOTH ROLES
// @desc    Update farm details (Admin and Veterinarian)
// @route   PUT /api/farm/admin-profile
// @access  Private (Admin and Veterinarian)
router.put('/admin-profile', protect, async (req, res) => {
  try {
    // Check if user is admin or veterinarian
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      return res.status(403).json({ message: 'Admin or veterinarian access required' });
    }

    const { 
      farmId, 
      userId, 
      name, type, location, size, establishedYear, registrationId, description,
      contactInfo,
      // Admin-only fields
      registrationStatus, verificationStatus, complianceStatus, notes, userRole 
    } = req.body;

    // Update farm details (allowed for both admin and vet)
    if (farmId) {
      const farmUpdate = {
        name, type, location, size, establishedYear, registrationId, description
      };

      // Add contact info if provided
      if (contactInfo) {
        farmUpdate.contactInfo = contactInfo;
      }

      // Only allow admin to update administrative fields
      if (req.user.role === 'admin') {
        if (registrationStatus) farmUpdate.registrationStatus = registrationStatus;
        if (verificationStatus) farmUpdate.verificationStatus = verificationStatus;
        if (complianceStatus) farmUpdate.complianceStatus = complianceStatus;
        if (notes) farmUpdate.adminNotes = notes;
      }

      // Remove undefined fields
      Object.keys(farmUpdate).forEach(key => {
        if (farmUpdate[key] === undefined) delete farmUpdate[key];
      });

      await Farm.findByIdAndUpdate(farmId, farmUpdate, { new: true });
    }

    // Only allow admin to update user roles
    if (req.user.role === 'admin' && userId && userRole) {
      await User.findByIdAndUpdate(userId, { role: userRole });
    }

    res.json({ message: 'Farm details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;