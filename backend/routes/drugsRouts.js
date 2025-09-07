// routes/drugRoutes.js
const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');

// @desc    Get all drugs
// @route   GET /api/drugs
// @access  Public (or add auth later)
router.get('/', async (req, res) => {
  try {
    const drugs = await Drug.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(drugs);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    res.status(500).json({ message: 'Server error while fetching drugs' });
  }
});

// @desc    Get single drug
// @route   GET /api/drugs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    
    if (!drug) {
      return res.status(404).json({ message: 'Drug not found' });
    }
    
    if (!drug.isActive) {
      return res.status(404).json({ message: 'Drug is not active' });
    }
    
    res.status(200).json(drug);
  } catch (error) {
    console.error('Error fetching drug:', error);
    res.status(500).json({ message: 'Server error while fetching drug' });
  }
});

// @desc    Create new drug
// @route   POST /api/drugs
// @access  Private (add auth middleware later)
router.post('/', async (req, res) => {
  try {
    const { name, description, defaultDosage, withdrawalPeriod } = req.body;

    // Check if drug already exists
    const existingDrug = await Drug.findOne({ name });
    if (existingDrug) {
      return res.status(400).json({ message: 'Drug with this name already exists' });
    }

    const drug = await Drug.create({
      name,
      description,
      defaultDosage,
      withdrawalPeriod
    });

    res.status(201).json(drug);
  } catch (error) {
    console.error('Error creating drug:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error while creating drug' });
  }
});

// @desc    Update drug
// @route   PUT /api/drugs/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { name, description, defaultDosage, withdrawalPeriod, isActive } = req.body;

    const drug = await Drug.findById(req.params.id);
    
    if (!drug) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    // Check if new name conflicts with other drugs
    if (name && name !== drug.name) {
      const existingDrug = await Drug.findOne({ name });
      if (existingDrug) {
        return res.status(400).json({ message: 'Drug with this name already exists' });
      }
    }

    const updatedDrug = await Drug.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || drug.name,
        description: description !== undefined ? description : drug.description,
        defaultDosage: defaultDosage || drug.defaultDosage,
        withdrawalPeriod: withdrawalPeriod || drug.withdrawalPeriod,
        isActive: isActive !== undefined ? isActive : drug.isActive
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedDrug);
  } catch (error) {
    console.error('Error updating drug:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error while updating drug' });
  }
});

// @desc    Delete drug (soft delete)
// @route   DELETE /api/drugs/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    
    if (!drug) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    // Soft delete by setting isActive to false
    await Drug.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({ message: 'Drug deleted successfully' });
  } catch (error) {
    console.error('Error deleting drug:', error);
    res.status(500).json({ message: 'Server error while deleting drug' });
  }
});

// @desc    Get all drugs (including inactive - for admin)
// @route   GET /api/drugs/admin/all
// @access  Private/Admin
router.get('/admin/all', async (req, res) => {
  try {
    const drugs = await Drug.find().sort({ name: 1 });
    res.status(200).json(drugs);
  } catch (error) {
    console.error('Error fetching all drugs:', error);
    res.status(500).json({ message: 'Server error while fetching all drugs' });
  }
});

module.exports = router;