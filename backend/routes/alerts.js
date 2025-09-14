// routes/alerts.js
const express = require('express');
const router = express.Router();
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const { protect } = require('../middleware/auth');

// @desc    Get all alerts and notifications
// @route   GET /api/alerts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    
    // console.log('Fetching alerts...'); // Debug log

    // 1. Check for upcoming withdrawal periods (next 7 days)
    const upcomingWithdrawals = await Treatment.find({
      withdrawalEndDate: { 
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    }).populate('drugId', 'name').populate('livestockGroupId', 'name species');

    // console.log('Upcoming withdrawals:', upcomingWithdrawals.length); // Debug log

    upcomingWithdrawals.forEach(treatment => {
      const daysLeft = Math.ceil((treatment.withdrawalEndDate - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: daysLeft <= 2 ? 'critical' : 'warning',
        message: `${treatment.drugId?.name || 'Unknown drug'} withdrawal period ends in ${daysLeft} day(s)`,
        details: `Group: ${treatment.livestockGroupId?.name || 'Unknown group'}`, // Added null checks
        timestamp: treatment.dateAdministered,
        actionRequired: daysLeft <= 2,
        priority: daysLeft <= 2 ? 'high' : 'medium'
      });
    });

    // 2. Check for groups under treatment
    const groupsUnderTreatment = await LivestockGroup.find({
      status: 'under_treatment'
    });

    // console.log('Groups under treatment:', groupsUnderTreatment.length); // Debug log

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

    // 3. Check for recent treatments (last 24 hours)
    const recentTreatments = await Treatment.find({
      dateAdministered: {
        $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }
    })
    .populate('drugId', 'name')
    .populate('livestockGroupId', 'name species')
    .sort({ dateAdministered: -1 })
    .limit(5);

    // console.log('Recent treatments:', recentTreatments.length); // Debug log

    recentTreatments.forEach(treatment => {
      alerts.push({
        type: 'info',
        message: `Recent treatment: ${treatment.drugId?.name || 'Unknown drug'}`,
        details: `Administered to ${treatment.livestockGroupId?.name || 'Unknown group'}`,
        timestamp: treatment.dateAdministered,
        actionRequired: false,
        priority: 'low'
      });
    });

    // Sort by priority and timestamp
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 3;
      const priorityB = priorityOrder[b.priority] || 3;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // console.log('Total alerts generated:', alerts.length); // Debug log

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message 
    });
  }
});

module.exports = router;