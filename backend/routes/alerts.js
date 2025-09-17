// routes/alerts.js - Update to be user-specific
const express = require('express');
const router = express.Router();
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const Drug = require('../models/Drug');
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');

// Helper function to get user's accessible farm IDs
const getUserFarmIds = async (userId, userRole) => {
  if (userRole === 'admin' || userRole === 'veterinarian') {
    const allFarms = await Farm.find({}, '_id');
    return allFarms.map(farm => farm._id);
  } else {
    const userFarms = await Farm.find({ owner: userId });
    return userFarms.map(farm => farm._id);
  }
};

// @desc    Get user-specific alerts
// @route   GET /api/alerts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get user's accessible farms
    const userFarmIds = await getUserFarmIds(userId, userRole);
    
    // 1. Check for upcoming withdrawal periods in user's farms
    const livestockGroups = await LivestockGroup.find({ farmId: { $in: userFarmIds } });
    const groupIds = livestockGroups.map(group => group._id);

    const upcomingWithdrawals = await Treatment.find({
      livestockGroupId: { $in: groupIds },
      withdrawalEndDate: { 
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    }).populate('drugId', 'name').populate('livestockGroupId', 'name species');

    upcomingWithdrawals.forEach(treatment => {
      const daysLeft = Math.ceil((treatment.withdrawalEndDate - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: daysLeft <= 2 ? 'critical' : 'warning',
        message: `${treatment.drugId.name} withdrawal period ends in ${daysLeft} day(s)`,
        details: `Group: ${treatment.livestockGroupId.name} (${treatment.livestockGroupId.species})`,
        timestamp: treatment.dateAdministered,
        actionRequired: daysLeft <= 2,
        priority: daysLeft <= 2 ? 'high' : 'medium'
      });
    });

    // 2. Check for groups under treatment in user's farms
    const groupsUnderTreatment = await LivestockGroup.find({
      farmId: { $in: userFarmIds },
      status: 'under_treatment'
    });

    groupsUnderTreatment.forEach(group => {
      alerts.push({
        type: 'info',
        message: `${group.name} is under treatment`,
        details: `${group.species} group needs monitoring`,
        timestamp: new Date(),
        actionRequired: false,
        priority: 'low'
      });
    });

    // 3. Check for recent treatments in user's farms (last 24 hours)
    const recentTreatments = await Treatment.find({
      livestockGroupId: { $in: groupIds },
      dateAdministered: {
        $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }
    })
    .populate('drugId', 'name')
    .populate('livestockGroupId', 'name species')
    .sort({ dateAdministered: -1 })
    .limit(5);

    recentTreatments.forEach(treatment => {
      alerts.push({
        type: 'info',
        message: `Recent treatment: ${treatment.drugId.name}`,
        details: `Administered to ${treatment.livestockGroupId.name}`,
        timestamp: treatment.dateAdministered,
        actionRequired: false,
        priority: 'low'
      });
    });

    // Sort by priority and timestamp (newest first)
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    alerts.sort((a, b) => {
      const priorityA = priorityOrder[a.type] || 4;
      const priorityB = priorityOrder[b.type] || 4;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json({ alerts });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
});

module.exports = router;