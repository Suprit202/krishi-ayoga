const mongoose = require('mongoose');
const Drug = require('../models/Drug');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('../config/database');
connectDB();

const drugData = [
  {
    name: 'Penicillin G',
    description: 'Broad-spectrum antibiotic for bacterial infections',
    defaultDosage: '20,000 IU/kg',
    withdrawalPeriod: 10 // days
  },
  {
    name: 'Oxytetracycline',
    description: 'Antibiotic for respiratory and gastrointestinal infections',
    defaultDosage: '10 mg/kg',
    withdrawalPeriod: 18
  },
  {
    name: 'Ivermectin',
    description: 'Antiparasitic for internal and external parasites',
    defaultDosage: '0.2 mg/kg',
    withdrawalPeriod: 28
  },
  {
    name: 'Flunixin Meglumine',
    description: 'Anti-inflammatory for pain and fever',
    defaultDosage: '2.2 mg/kg',
    withdrawalPeriod: 5
  },
  {
    name: 'Enrofloxacin',
    description: 'Broad-spectrum antibiotic for serious infections',
    defaultDosage: '5 mg/kg',
    withdrawalPeriod: 14
  }
];

const seedDrugs = async () => {
  try {
    // Clear existing drugs
    await Drug.deleteMany();
    console.log('Existing drugs cleared');

    // Insert new drugs
    await Drug.insertMany(drugData);
    console.log('Drugs seeded successfully');

    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding drugs:', error);
    process.exit(1);
  }
};

seedDrugs();