// backend/models/Farm.js
const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a farm name'],
    trim: true,
    maxlength: [100, 'Farm name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  farmType: {
    type: String,
    enum: ['Dairy', 'Poultry', 'Swine', 'Aquaculture', 'Mixed', 'Other'],
    required: true
  },
  registrationId: {
    type: String,
    unique: true,
    sparse: true
  },
  contactInfo: {
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  // ADD THIS FIELD for two-way relationship
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Farm', FarmSchema);