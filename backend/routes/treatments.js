// backend/routes/treatments.js
const express = require('express');
const { protect } = require('../middleware/auth');
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const Drug = require('../models/Drug'); // Import Drug model
const crypto = require('crypto');

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

    // Get the drug and group data first
    const drug = await Drug.findById(drugId);
    const group = await LivestockGroup.findById(livestockGroupId);

    if (!drug) {
      return res.status(404).json({ message: 'Drug not found' });
    }
    if (!group) {
      return res.status(404).json({ message: 'Livestock group not found' });
    }

    // Calculate withdrawal date
    const adminDate = dateAdministered ? new Date(dateAdministered) : new Date();
    const withdrawalEnd = new Date(adminDate);
    withdrawalEnd.setDate(withdrawalEnd.getDate() + drug.withdrawalPeriod);

    // Generate hash
    const dataString = `${livestockGroupId}${drugId}${adminDate}${dosage}${Date.now()}`;
    const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

    // Create treatment with all required fields
    const treatment = await Treatment.create({
      livestockGroupId,
      drugId,
      dosage,
      dateAdministered: adminDate,
      notes,
      administeredBy: req.user._id,
      withdrawalEndDate: withdrawalEnd,
      dataHash: dataHash,
      drugName: drug.name,
      groupName: group.name,
      species: group.species
    });

    // Update livestock group status
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

    // Populate for response
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

    // Find active treatments for this group
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

module.exports = router;