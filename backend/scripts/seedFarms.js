// backend/scripts/seedFarms.js
const mongoose = require('mongoose');
const Farm = require('../models/Farm');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('../config/database');
connectDB();

const seedFarms = async () => {
  try {
    // Clear existing data
    await Farm.deleteMany();
    console.log('Existing farms cleared');

    // Create sample farms
    const farms = await Farm.insertMany([
      {
        name: 'Green Valley Dairy Farm',
        location: 'Maharashtra',
        farmType: 'Dairy',
        registrationId: 'FARM-001',
        contactInfo: {
          phone: '+91-9876543210',
          email: 'info@greenvalleydairy.com',
          address: {
            street: '123 Farm Road',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411028',
            country: 'India'
          }
        }
      },
      {
        name: 'Sunrise Poultry Farm',
        location: 'Tamil Nadu',
        farmType: 'Poultry',
        registrationId: 'FARM-002',
        contactInfo: {
          phone: '+91-8765432109',
          email: 'contact@sunrisepoultry.com',
          address: {
            street: '456 Chicken Lane',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            zipCode: '641004',
            country: 'India'
          }
        }
      }
    ]);

    console.log('Farms seeded successfully');


const users = await User.find();
if (users.length > 0) {
  for (let i = 0; i < Math.min(users.length, farms.length); i++) {
    // Update user
    users[i].farmId = farms[i]._id;
    await users[i].save();
    
    // Update farm
    if (!farms[i].users.includes(users[i]._id)) {
      farms[i].users.push(users[i]._id);
      await farms[i].save();
    }
  }
  console.log('Users assigned to farms');
}

    process.exit(0);
  } catch (error) {
    console.error('Error seeding farms:', error);
    process.exit(1);
  }
};

seedFarms();