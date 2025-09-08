// backend/routes/treatments.js
const express = require('express');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const Drug = require('../models/Drug');
const Farm = require('../models/Farm');
const { anomalyDetector } = require('../ai-services');
const { outbreakPredictor } = require('../ai-services');

const router = express.Router();

// @desc    Get all treatments for user's livestock
// @route   GET /api/treatments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const treatments = await Treatment.find()
      .populate('livestockGroupId', 'name species')
      .populate('drugId', 'name withdrawalPeriod')
      .populate('administeredBy', 'name')
      .sort({ dateAdministered: -1 });

    res.json(treatments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create new treatment
// @route   POST /api/treatments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { livestockGroupId, drugId, dosage, dateAdministered, notes } = req.body;

    const drug = await Drug.findById(drugId);
    const group = await LivestockGroup.findById(livestockGroupId);

    if (!drug) return res.status(404).json({ message: 'Drug not found' });
    if (!group) return res.status(404).json({ message: 'Livestock group not found' });

    const adminDate = dateAdministered ? new Date(dateAdministered) : new Date();
    const withdrawalEnd = new Date(adminDate);
    withdrawalEnd.setDate(withdrawalEnd.getDate() + drug.withdrawalPeriod);

    const dataString = `${livestockGroupId}${drugId}${adminDate}${dosage}${Date.now()}`;
    const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

    const aiAnalysis = await anomalyDetector.detectAnomalies(
      { drugId, dosage, livestockGroupId, dateAdministered: adminDate },
      drug,
      group
    );

    const treatment = await Treatment.create({
      livestockGroupId,
      drugId,
      dosage,
      dateAdministered: adminDate,
      notes,
      administeredBy: req.user._id,
      withdrawalEndDate: withdrawalEnd,
      dataHash,
      drugName: drug.name,
      groupName: group.name,
      species: group.species,
      aiAnalysis
    });

    await LivestockGroup.findByIdAndUpdate(
      livestockGroupId,
      { 
        status: 'under_treatment',
        $push: {
          currentTreatments: {
            drugName: drug.name,
            dateAdministered: adminDate,
            withdrawalEndDate: withdrawalEnd
          }
        }
      }
    );

    const populatedTreatment = await Treatment.findById(treatment._id)
      .populate('livestockGroupId', 'name species')
      .populate('drugId', 'name withdrawalPeriod')
      .populate('administeredBy', 'name');

    res.status(201).json(populatedTreatment);

  } catch (error) {
    console.error('Treatment creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Check if livestock group is ready for sale
// @route   GET /api/treatments/check-sale/:groupId
// @access  Private
router.get('/check-sale/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentDate = new Date();

    const activeTreatments = await Treatment.find({
      livestockGroupId: groupId,
      withdrawalEndDate: { $gt: currentDate }
    }).populate('drugId', 'name withdrawalPeriod');

    const isReadyForSale = activeTreatments.length === 0;
    const warnings = activeTreatments.map(treatment => ({
      drug: treatment.drugId.name,
      withdrawalDays: treatment.drugId.withdrawalPeriod,
      safeAfter: treatment.withdrawalEndDate.toDateString()
    }));

    res.json({
      canSell: isReadyForSale,
      warnings,
      checkDate: currentDate.toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get treatments by farm
// @route   GET /api/treatments/farm/:farmId
// @access  Private
router.get('/farm/:farmId', protect, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.farmId.toString() !== farmId) {
      return res.status(403).json({ message: 'Not authorized to access this farm' });
    }

    const groups = await LivestockGroup.find({ farmId });
    const groupIds = groups.map(group => group._id);
    
    const treatments = await Treatment.find({ 
      livestockGroupId: { $in: groupIds } 
    })
    .populate('livestockGroupId', 'name species')
    .populate('drugId', 'name withdrawalPeriod')
    .populate('administeredBy', 'name')
    .sort({ dateAdministered: -1 });

    const farm = await Farm.findById(farmId).select('name location farmType');

    res.json({
      farm,
      livestockGroupCount: groups.length,
      treatmentCount: treatments.length,
      treatments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get outbreak risk prediction for farm
// @route   GET /api/treatments/farm/:farmId/outbreak-risk
// @access  Private
router.get('/farm/:farmId/outbreak-risk', protect, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    // Authorization check
    if (req.user.role !== 'admin' && req.user.farmId.toString() !== farmId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const prediction = await outbreakPredictor.predictOutbreakRisk(farmId);
    
    res.json(prediction);
  } catch (error) {
    console.error('Outbreak prediction error:', error);
    res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
  }
});

// @desc    Get specific treatment by ID
// @route   GET /api/treatments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate('livestockGroupId', 'name species')
      .populate('drugId', 'name withdrawalPeriod')
      .populate('administeredBy', 'name');
    
    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }
    
    res.json(treatment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Analyze treatment with AI (preview only - no save)
// @route   POST /api/treatments/analyze
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const { livestockGroupId, drugId, dosage, dateAdministered } = req.body;

    const drug = await Drug.findById(drugId);
    const group = await LivestockGroup.findById(livestockGroupId);

    if (!drug) return res.status(404).json({ message: 'Drug not found' });
    if (!group) return res.status(404).json({ message: 'Livestock group not found' });

    const adminDate = dateAdministered ? new Date(dateAdministered) : new Date();

    // Use your existing anomaly detector for analysis
    const aiAnalysis = await anomalyDetector.detectAnomalies(
      { drugId, dosage, livestockGroupId, dateAdministered: adminDate },
      drug,
      group
    );

    // Calculate withdrawal period for preview
    const withdrawalEnd = new Date(adminDate);
    withdrawalEnd.setDate(withdrawalEnd.getDate() + drug.withdrawalPeriod);

    res.status(200).json({
      analysis: aiAnalysis,
      drug: {
        name: drug.name,
        withdrawalPeriod: drug.withdrawalPeriod
      },
      group: {
        name: group.name,
        species: group.species
      },
      dosage,
      dateAdministered: adminDate,
      withdrawalEndDate: withdrawalEnd,
      preview: true // Indicate this is a preview, not saved data
    });

  } catch (error) {
    console.error('Treatment analysis error:', error);
    res.status(500).json({ message: 'Analysis failed', error: error.message });
  }
});

module.exports = router;