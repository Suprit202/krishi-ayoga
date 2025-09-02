// backend/scripts/createDemoData.js
const mongoose = require('mongoose');
const Treatment = require('../models/Treatment');
const LivestockGroup = require('../models/LivestockGroup');
const Drug = require('../models/Drug');
const Farm = require('../models/Farm');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('../config/database');
connectDB();

async function createDemoData() {
  try {
    console.log('🎯 Creating impressive demo data...');

    // Get existing data
    const farms = await Farm.find();
    const drugs = await Drug.find();
    const groups = await LivestockGroup.find();

    if (farms.length === 0 || drugs.length === 0 || groups.length === 0) {
      console.log('❌ Please create farms, drugs, and livestock groups first');
      process.exit(1);
    }

    const farm = farms[0];
    const cattleGroup = groups.find(g => g.species === 'Cattle');
    const poultryGroup = groups.find(g => g.species === 'Poultry');
    const oxytetracycline = drugs.find(d => d.name === 'Oxytetracycline');
    const penicillin = drugs.find(d => d.name === 'Penicillin G');

    // Clear existing treatments
    await Treatment.deleteMany({});
    console.log('🧹 Cleared existing treatments');

    // 1. PERFECT TREATMENT (No flags)
    const perfectTreatment = await Treatment.create({
      livestockGroupId: cattleGroup._id,
      drugId: oxytetracycline._id,
      dosage: '15 mg/kg',
      dateAdministered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      notes: 'Routine respiratory treatment - perfect dosage',
      administeredBy: new mongoose.Types.ObjectId(), // Mock user
      withdrawalEndDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days left
      drugName: oxytetracycline.name,
      groupName: cattleGroup.name,
      species: cattleGroup.species,
      aiAnalysis: {
        anomalies: [],
        warnings: [],
        confidence: 0.85
      }
    });

    // 2. HIGH DOSAGE ANOMALY (Red flag 🚨)
    const highDosageTreatment = await Treatment.create({
      livestockGroupId: cattleGroup._id,
      drugId: oxytetracycline._id,
      dosage: '35 mg/kg', // Above threshold!
      dateAdministered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: 'Emergency treatment - high dosage',
      administeredBy: new mongoose.Types.ObjectId(),
      withdrawalEndDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days left
      drugName: oxytetracycline.name,
      groupName: cattleGroup.name,
      species: cattleGroup.species,
      aiAnalysis: {
        anomalies: [
          {
            type: 'high_dosage',
            severity: 'high',
            message: 'Dosage (35mg/kg) exceeds recommended limit for Cattle. Maximum: 20mg/kg'
          }
        ],
        warnings: [],
        confidence: 0.92
      }
    });

    // 3. SPECIES INCOMPATIBILITY (Yellow flag ⚠️)
    const wrongSpeciesTreatment = await Treatment.create({
      livestockGroupId: poultryGroup._id, // Poultry group
      drugId: oxytetracycline._id,        // But using cattle drug
      dosage: '10 mg/kg',
      dateAdministered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      notes: 'Trying oxytetracycline for poultry',
      administeredBy: new mongoose.Types.ObjectId(),
      withdrawalEndDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days left
      drugName: oxytetracycline.name,
      groupName: poultryGroup.name,
      species: poultryGroup.species,
      aiAnalysis: {
        anomalies: [],
        warnings: [
          {
            type: 'off_label_species',
            severity: 'medium',
            message: 'Oxytetracycline is not typically approved for Poultry. Consult veterinarian.'
          }
        ],
        confidence: 0.85
      }
    });

    // 4. FREQUENT USE WARNING (Yellow flag ⚠️)
    // Create multiple treatments to trigger frequent use detection
    for (let i = 0; i < 4; i++) {
      await Treatment.create({
        livestockGroupId: cattleGroup._id,
        drugId: penicillin._id,
        dosage: '20 mg/kg',
        dateAdministered: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000), // Staggered dates
        notes: `Treatment #${i + 1} with Penicillin`,
        administeredBy: new mongoose.Types.ObjectId(),
        withdrawalEndDate: new Date(Date.now() + (10 - i * 5) * 24 * 60 * 60 * 1000),
        drugName: penicillin.name,
        groupName: cattleGroup.name,
        species: cattleGroup.species,
        aiAnalysis: {
          anomalies: [],
          warnings: i >= 2 ? [
            {
              type: 'frequent_use',
              severity: 'medium',
              message: `Frequent use detected: ${i + 1} treatments with Penicillin in past 30 days`
            }
          ] : [],
          confidence: 0.85
        }
      });
    }

    console.log('✅ Demo data created successfully!');
    console.log('📊 Treatments created:');
    console.log('   - Perfect treatment (no flags)');
    console.log('   - High dosage anomaly 🚨');
    console.log('   - Species incompatibility ⚠️');
    console.log('   - Frequent use warnings ⚠️');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }
}

createDemoData();