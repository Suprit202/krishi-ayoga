// routes/reports.js
const express = require('express');
const { protect } = require('../middleware/auth');
const Report = require('../models/Report');
const router = express.Router();
const LivestockGroup = require('../models/LivestockGroup');
const Farm = require('../models/Farm');

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

// Get all reports for current user
// routes/reports.js - Update the GET / endpoint
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'farmer') {
      // Farmers see reports about their livestock OR reports without farmerId
      const userFarms = await getUserFarmIds(req.user._id, req.user.role);
      const userFarmIds = userFarms.map(farm => farm._id.toString());

      // Get livestock groups owned by this farmer
      const userLivestockGroups = await LivestockGroup.find({
        'farmId': { $in: userFarmIds }
      }).select('_id');

      const userLivestockGroupIds = userLivestockGroups.map(group => group._id.toString());

      // Show reports that either:
      // 1. Have this farmer's farmerId, OR
      // 2. Are associated with this farmer's livestock groups (even if farmerId is missing)
      filter = {
        $or: [
          { farmerId: req.user._id },
          { livestockGroupId: { $in: userLivestockGroupIds } }
        ]
      };
    }

    // Veterinarians see reports they created
    if (req.user.role === 'veterinarian') {
      filter.veterinarianId = req.user._id;
    }

    // Admins see all reports
    if (req.user.role === 'admin') {
      filter = {}; // No filter for admin
    }

    const reports = await Report.find(filter)
      .populate('livestockGroupId', 'name species')
      .populate('treatmentId', 'drugName dateAdministered')
      .populate('veterinarianId', 'name email')
      .populate({
        path: 'farmId',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// routes/reports.js - Update the POST endpoint
router.post('/', protect, async (req, res) => {
  try {
    // Only veterinarians can create reports
    if (req.user.role !== 'veterinarian') {
      return res.status(403).json({ message: 'Only veterinarians can create reports' });
    }

    const report = new Report({
      ...req.body,
      veterinarianId: req.user._id
    });

    const savedReport = await report.save();
    
    // Make this consistent with the GET endpoint
    const populatedReport = await Report.findById(savedReport._id)
      .populate('livestockGroupId', 'name species')
      .populate('treatmentId', 'drugName dateAdministered')
      .populate('veterinarianId', 'name email')
      .populate('farmerId', 'name email')
      .populate({
        path: 'farmId',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });

    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// routes/reports.js - Update message endpoint
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('livestockGroupId', 'name species')
      .populate('treatmentId', 'drugName dateAdministered')
      .populate('veterinarianId', 'name email')
      .populate('farmerId', 'name email')
      .populate({
        path: 'farmId',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check authorization
    const isVeterinarian = req.user._id.toString() === report.veterinarianId._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isFarmer = req.user.role === 'farmer';
    
    if (!isVeterinarian && !isAdmin && !isFarmer) {
      return res.status(403).json({ message: 'Not authorized to add messages to this report' });
    }
    
    // Validate message content
    if (!req.body.content || typeof req.body.content !== 'string' || req.body.content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const message = {
      senderId: req.user._id,
      senderRole: req.user.role,
      content: req.body.content.trim()
    };
    
    report.messages.push(message);
    await report.save();
    
    // Return the fully populated report (consistent with GET)
    const populatedReport = await Report.findById(report._id)
      .populate('livestockGroupId', 'name species')
      .populate('treatmentId', 'drugName dateAdministered')
      .populate('veterinarianId', 'name email')
      .populate('farmerId', 'name email')
      .populate({
        path: 'farmId',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });
    
    res.json(populatedReport);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(400).json({ message: error.message });
  }
});

// routes/reports.js - Update status endpoint
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // More restrictive: Only veterinarian who created report or admin can update status
    const isVeterinarian = req.user._id.toString() === report.veterinarianId.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isVeterinarian && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }
    
    report.status = req.body.status;
    await report.save();
    
    // Return populated report
    const populatedReport = await Report.findById(report._id)
      .populate('livestockGroupId', 'name species')
      .populate('treatmentId', 'drugName dateAdministered')
      .populate('veterinarianId', 'name email')
      .populate('farmerId', 'name email')
      .populate({
        path: 'farmId',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });
    
    res.json(populatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;