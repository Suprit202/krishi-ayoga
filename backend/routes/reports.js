// routes/reports.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const Drug = require('../models/Drug');
const Farm = require('../models/Farm');

// Helper function to get user's accessible farm IDs
const getUserFarmIds = async (userId, userRole) => {
  if (userRole === 'admin') {
    // Admin can access all farms
    const allFarms = await Farm.find({}, '_id');
    return allFarms.map(farm => farm._id);
  } else {
    // Farmers can only access their own farms
    const userFarms = await Farm.find({ owner: userId });
    return userFarms.map(farm => farm._id);
  }
};

// Helper function to get filter for user's data
const getUserDataFilter = async (userId, userRole) => {
  let filter = {};
  
  if (userRole !== 'admin') {
    const userFarmIds = await getUserFarmIds(userId, userRole);
    const livestockGroups = await LivestockGroup.find({ farmId: { $in: userFarmIds } });
    const groupIds = livestockGroups.map(group => group._id);
    
    filter = { livestockGroupId: { $in: groupIds } };
  }
  
  return filter;
};

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

    // Get user-specific filter
    const userFilter = await getUserDataFilter(req.user._id, req.user.role);
    const dateFilter = { dateAdministered: { $gte: startDate } };
    const filter = { ...userFilter, ...dateFilter };

    // Get treatment statistics
    const treatments = await Treatment.find(filter);

    // Group by month for chart data
    const monthlyData = Array(12).fill(0);
    treatments.forEach(treatment => {
      const month = new Date(treatment.dateAdministered).getMonth();
      monthlyData[month] += 1;
    });

    // Count by status (if your Treatment model has status field)
    const statusCount = {
      completed: await Treatment.countDocuments({ ...filter, status: 'completed' }),
      in_progress: await Treatment.countDocuments({ ...filter, status: 'in_progress' }),
      scheduled: await Treatment.countDocuments({ ...filter, status: 'scheduled' })
    };

    res.json({
      total: treatments.length,
      byStatus: statusCount,
      byMonth: monthlyData,
      period: range
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
    let filter = {};
    
    if (req.user.role !== 'admin') {
      // Non-admin users only see their own livestock
      const userFarmIds = await getUserFarmIds(req.user._id, req.user.role);
      filter = { farmId: { $in: userFarmIds } };
    }

    // Get all livestock groups with filter
    const groups = await LivestockGroup.find(filter);

    // Calculate totals and distributions
    let totalAnimals = 0;
    const bySpecies = {};
    const healthStatus = { healthy: 0, under_treatment: 0 };

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
      totalGroups,
      bySpecies,
      healthStatus: healthPercentages,
      groups: groups.map(group => ({
        name: group.name,
        species: group.species,
        count: group.count,
        status: group.status
      }))
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

    // Get user-specific filter
    const userFilter = await getUserDataFilter(req.user._id, req.user.role);
    const dateFilter = { dateAdministered: { $gte: startDate } };
    const filter = { ...userFilter, ...dateFilter };

    // Get treatments in date range with drug information
    const treatments = await Treatment.find(filter).populate('drugId', 'name price');

    // Calculate drug usage and costs
    const drugUsage = {};
    
    treatments.forEach(treatment => {
      if (treatment.drugId) {
        const drugName = treatment.drugId.name;
        if (!drugUsage[drugName]) {
          drugUsage[drugName] = {
            usage: 0,
            cost: 0,
            drugId: treatment.drugId._id
          };
        }
        
        drugUsage[drugName].usage += 1;
        
        // Calculate cost
        if (treatment.drugId.price) {
          drugUsage[drugName].cost += treatment.drugId.price;
        }
      }
    });

    // Convert to array and sort by usage
    const topDrugs = Object.entries(drugUsage)
      .map(([drugName, data]) => ({
        drug: drugName,
        drugId: data.drugId,
        usage: data.usage,
        cost: data.cost
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    res.json({
      topDrugs,
      totalTreatments: treatments.length,
      period: range,
      totalCost: topDrugs.reduce((sum, drug) => sum + drug.cost, 0)
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
    let farmFilter = {};
    
    if (req.user.role !== 'admin') {
      // Non-admin users only see data from their farms
      const userFarmIds = await getUserFarmIds(req.user._id, req.user.role);
      
      // Get livestock groups for these farms
      const livestockGroups = await LivestockGroup.find({ farmId: { $in: userFarmIds } });
      const groupIds = livestockGroups.map(group => group._id);
      
      farmFilter = { livestockGroupId: { $in: groupIds } };
    }

    // Get treatments and livestock with filter
    const treatments = await Treatment.find(farmFilter);
    const livestockGroups = await LivestockGroup.find(
      req.user.role !== 'admin' ? { farmId: { $in: await getUserFarmIds(req.user._id, req.user.role) } } : {}
    );

    // Calculate statistics
    const totalAnimals = livestockGroups.reduce((sum, group) => sum + (group.count || 0), 0);
    
    const healthStatus = { healthy: 0, under_treatment: 0 };
    livestockGroups.forEach(group => {
      if (group.status) {
        healthStatus[group.status] = (healthStatus[group.status] || 0) + 1;
      }
    });

    // Recent treatments (last 5)
    const recentTreatments = await Treatment.find(farmFilter)
      .populate('livestockGroupId', 'name')
      .populate('drugId', 'name')
      .sort({ dateAdministered: -1 })
      .limit(5);

    res.json({
      treatments: {
        total: treatments.length,
        completed: treatments.filter(t => t.status === 'completed').length,
        inProgress: treatments.filter(t => t.status === 'in_progress').length
      },
      livestock: {
        totalAnimals,
        totalGroups: livestockGroups.length,
        healthy: healthStatus.healthy || 0,
        underTreatment: healthStatus.under_treatment || 0
      },
      recentTreatments: recentTreatments.map(t => ({
        drugName: t.drugId?.name,
        groupName: t.livestockGroupId?.name,
        dateAdministered: t.dateAdministered
      }))
    });

  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;