// routes/reports.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const Drug = require('../models/Drug');

// @desc    Get treatment statistics
// @route   GET /api/reports/treatments
// @access  Private
router.get('/treatments', protect, async (req, res) => {
  try {
    const { range = '30days' } = req.query;
    
    // Calculate date range
    const startDate = new Date();
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default: // 30 days
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get treatment statistics
    const treatments = await Treatment.find({
      dateAdministered: { $gte: startDate }
    });

    // Group by month for chart data
    const monthlyData = Array(12).fill(0);
    treatments.forEach(treatment => {
      const month = new Date(treatment.dateAdministered).getMonth();
      monthlyData[month] += 1;
    });

    // Count by status
    const statusCount = {
      completed: await Treatment.countDocuments({ 
        dateAdministered: { $gte: startDate },
        status: 'completed'
      }),
      in_progress: await Treatment.countDocuments({ 
        dateAdministered: { $gte: startDate },
        status: 'in_progress'
      }),
      scheduled: await Treatment.countDocuments({ 
        dateAdministered: { $gte: startDate },
        status: 'scheduled'
      })
    };

    res.json({
      total: treatments.length,
      byStatus: statusCount,
      byMonth: monthlyData
    });

  } catch (error) {
    console.error('Treatment report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get livestock statistics
// @route   GET /api/reports/livestock
// @access  Private
router.get('/livestock', protect, async (req, res) => {
  try {
    // Get all livestock groups
    const groups = await LivestockGroup.find();

    // Calculate totals and distributions
    let totalAnimals = 0;
    const bySpecies = {};
    const healthStatus = { healthy: 0, under_treatment: 0};

    groups.forEach(group => {
      totalAnimals += group.count || 0;
      
      // Count by species
      if (group.species) {
        bySpecies[group.species] = (bySpecies[group.species] || 0) + (group.count || 0);
      }

      // Count by health status
      if (group.status) {
        healthStatus[group.status] = (healthStatus[group.status] || 0) + 1;
      }
    });

    // Convert counts to percentages for health status
    const totalGroups = groups.length;
    const healthPercentages = {};
    Object.keys(healthStatus).forEach(status => {
      healthPercentages[status] = totalGroups > 0 
        ? Math.round((healthStatus[status] / totalGroups) * 100)
        : 0;
    });

    res.json({
      totalAnimals,
      bySpecies,
      healthStatus: healthPercentages
    });

  } catch (error) {
    console.error('Livestock report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get drug usage statistics
// @route   GET /api/reports/drug-usage
// @access  Private
router.get('/drug-usage', protect, async (req, res) => {
  try {
    const { range = '30days' } = req.query;
    
    // Calculate date range
    const startDate = new Date();
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default: // 30 days
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get treatments in date range with drug information
    const treatments = await Treatment.find({
      dateAdministered: { $gte: startDate }
    }).populate('drugId', 'name price');

    // Calculate drug usage and costs
    const drugUsage = {};
    
    treatments.forEach(treatment => {
      if (treatment.drugId) {
        const drugName = treatment.drugId.name;
        if (!drugUsage[drugName]) {
          drugUsage[drugName] = {
            usage: 0,
            cost: 0,
            drugId: treatment.drugId
          };
        }
        
        drugUsage[drugName].usage += 1;
        
        // Calculate cost (assuming simple pricing - adjust as needed)
        if (treatment.drugId.price) {
          drugUsage[drugName].cost += treatment.drugId.price;
        }
      }
    });

    // Convert to array and sort by usage
    const topDrugs = Object.entries(drugUsage)
      .map(([drug, data]) => ({
        drug,
        drugId: data.drugId,
        usage: data.usage,
        cost: data.cost
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10); // Top 10 drugs

    res.json({
      topDrugs,
      totalTreatments: treatments.length,
      period: range
    });

  } catch (error) {
    console.error('Drug usage report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get comprehensive farm dashboard data
// @route   GET /api/reports/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [treatments, livestock, drugUsage] = await Promise.all([
      // Get treatment data
      Treatment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Get livestock data
      LivestockGroup.aggregate([
        {
          $group: {
            _id: null,
            totalAnimals: { $sum: '$count' },
            totalGroups: { $sum: 1 },
            healthy: {
              $sum: { $cond: [{ $eq: ['$status', 'healthy'] }, 1, 0] }
            },
            underTreatment: {
              $sum: { $cond: [{ $eq: ['$status', 'under_treatment'] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Get recent treatments for timeline
      Treatment.find()
        .populate('livestockGroupId', 'name species')
        .populate('drugId', 'name')
        .sort({ dateAdministered: -1 })
        .limit(5)
    ]);

    res.json({
      treatments: treatments[0] || { total: 0, completed: 0, inProgress: 0 },
      livestock: livestock[0] || { totalAnimals: 0, totalGroups: 0, healthy: 0, underTreatment: 0 },
      recentTreatments: drugUsage
    });

  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;