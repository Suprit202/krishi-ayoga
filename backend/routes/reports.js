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
// routes/reports.js - Update dashboard endpoint
router.get('/dashboard', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    // Today's treatments
    const todayTreatments = await Treatment.countDocuments({
      dateAdministered: { $gte: startOfToday }
    });

    // Active alerts (critical/warning)
    const activeAlerts = await Treatment.countDocuments({
      withdrawalEndDate: { 
        $lte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // Next 2 days
      }
    });

    // Compliance rate (treatments with proper withdrawal)
    const totalTreatments = await Treatment.countDocuments();
    const compliantTreatments = await Treatment.countDocuments({
      withdrawalEndDate: { $exists: true }
    });
    const complianceRate = totalTreatments > 0 
      ? Math.round((compliantTreatments / totalTreatments) * 100)
      : 100;

    // Upcoming treatments this week
    const upcomingTreatments = await Treatment.countDocuments({
      dateAdministered: { 
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    });

    // Compare with previous week for trends
    const previousWeekStart = new Date(startOfWeek);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(endOfWeek);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    const previousWeekTreatments = await Treatment.countDocuments({
      dateAdministered: { 
        $gte: previousWeekStart,
        $lte: previousWeekEnd
      }
    });

    const forecastTrend = previousWeekTreatments > 0 
      ? Math.round(((upcomingTreatments - previousWeekTreatments) / previousWeekTreatments) * 100)
      : 0;

    res.json({
      todayTreatments,
      activeAlerts,
      complianceRate,
      upcomingTreatments,
      forecastTrend,
      // Include minimal existing data for charts
      treatments: {
        total: totalTreatments,
        completed: await Treatment.countDocuments({ status: 'completed' }),
        inProgress: await Treatment.countDocuments({ status: 'in_progress' })
      },
      livestock: {
        totalAnimals: await LivestockGroup.aggregate([
          { $group: { _id: null, total: { $sum: '$count' } } }
        ]).then(result => result[0]?.total || 0),
        totalGroups: await LivestockGroup.countDocuments(),
        healthy: await LivestockGroup.countDocuments({ status: 'healthy' }),
        underTreatment: await LivestockGroup.countDocuments({ status: 'under_treatment' })
      },
      recentTreatments: await Treatment.find()
        .populate('livestockGroupId', 'name')
        .populate('drugId', 'name')
        .sort({ dateAdministered: -1 })
        .limit(5)
    });

  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;