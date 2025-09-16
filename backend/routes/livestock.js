const express = require('express');
const { protect } = require('../middleware/auth');
const LivestockGroup = require('../models/LivestockGroup');
const Farm = require('../models/Farm');

const router = express.Router();

// Helper function to get accessible farm IDs
const getUserFarmIds = async (userId, userRole) => {
  if (userRole === 'admin' || userRole === 'veterinarian') {
    // Admin/Vet can access all farms
    const allFarms = await Farm.find({}, '_id name');
    return allFarms;
  } else {
    // Farmers can only access their own farms
    const userFarms = await Farm.find({ owner: userId });
    return userFarms;
  }
};

// @desc    Get all livestock groups (with farm filtering for admin/vet)
// @route   GET /api/livestock
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // For admin/vet: allow filtering by farm via query parameter
    if (req.user.role === 'admin' || req.user.role === 'veterinarian') {
      if (req.query.farmId && req.query.farmId !== 'all') {
        query.farmId = req.query.farmId;
      }
    } else {
      // For regular users (farmers): only show their farms' livestock
      const userFarms = await getUserFarmIds(req.user._id, req.user.role);
      query.farmId = { $in: userFarms.map(farm => farm._id) };
    }

    const groups = await LivestockGroup.find(query)
      .populate('farmId', 'name location') // Populate farm details
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Get livestock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all farms for filter dropdown (admin/vet only)
// @route   GET /api/livestock/farms
// @access  Private
router.get('/farms', protect, async (req, res) => {
  try {
    // Only admin and veterinarian can access this endpoint
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      return res.status(403).json({ message: 'Access denied. Admin/Veterinarian only.' });
    }

    const farms = await Farm.find({}).select('name location owner');
    res.json(farms);
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get single livestock group
// @route   GET /api/livestock/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await LivestockGroup.findById(req.params.id)
      .populate('farmId', 'name location') // Populate farm details
      .populate('currentTreatments');

    if (!group) {
      return res.status(404).json({ message: 'Livestock group not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      // For farmers, check if they own the farm
      const userFarms = await getUserFarmIds(req.user._id, req.user.role);
      const userFarmIds = userFarms.map(farm => farm._id.toString());
      
      if (!userFarmIds.includes(group.farmId._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this livestock group' });
      }
    }

    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching livestock group:', error);
    res.status(500).json({ message: 'Server error while fetching livestock group' });
  }
});

// @desc    Create new livestock group
// @route   POST /api/livestock
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, species, count, farmId } = req.body;

    let targetFarmId = farmId;

    // For regular farmers, they can only create groups in their own farm
    if (req.user.role === 'farmer') {
      if (!req.user.farmId) {
        return res.status(400).json({ message: 'User is not assigned to any farm' });
      }
      targetFarmId = req.user.farmId;
    }

    // For admin/vet, they must specify a farmId
    if ((req.user.role === 'admin' || req.user.role === 'veterinarian') && !farmId) {
      return res.status(400).json({ message: 'Farm ID is required for admin/veterinarian' });
    }

    // Verify the farm exists
    const farm = await Farm.findById(targetFarmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const group = await LivestockGroup.create({
      name,
      species,
      count,
      farmId: targetFarmId
    });

    // Populate the farm details in the response
    const populatedGroup = await LivestockGroup.findById(group._id)
      .populate('farmId', 'name location');

    res.status(201).json(populatedGroup);
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
    
    const group = await LivestockGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Livestock group not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      // For farmers, check if they own the farm
      const userFarms = await getUserFarmIds(req.user._id, req.user.role);
      const userFarmIds = userFarms.map(farm => farm._id.toString());
      
      if (!userFarmIds.includes(group.farmId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this livestock group' });
      }
    }

    // Update the status
    const updatedGroup = await LivestockGroup.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('farmId', 'name location');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get livestock groups by farm
// @route   GET /api/livestock/farm/:farmId
// @access  Private
router.get('/farm/:farmId', protect, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      // For farmers, they can only access their own farm
      const userFarms = await getUserFarmIds(req.user._id, req.user.role);
      const userFarmIds = userFarms.map(farm => farm._id.toString());
      
      if (!userFarmIds.includes(farmId)) {
        return res.status(403).json({ message: 'Not authorized to access this farm' });
      }
    }

    const groups = await LivestockGroup.find({ farmId })
      .populate('farmId', 'name location');
    
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