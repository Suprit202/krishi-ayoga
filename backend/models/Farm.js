// models/Farm.js
const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a farm name'],
    trim: true,
    maxlength: [100, 'Farm name cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['dairy', 'poultry', 'swine', 'aquaculture', 'mixed'],
    default: 'mixed'
  },
  location: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true }
  },
  contact: {
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true }
  },
  size: {
    type: Number,
    min: 0,
    default: 0
  },
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  registrationId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness for non-null values
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalAnimals: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Update the user's farm field when a farm is created/updated
FarmSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(doc.owner, {
    'farm.name': doc.name,
    'farm.type': doc.type,
    'farm.location': doc.location,
    'farm.contact': doc.contact,
    'farm.size': doc.size,
    'farm.establishedYear': doc.establishedYear,
    'farm.registrationId': doc.registrationId,
    'farm.description': doc.description,
    farmId: doc._id
  });
});

module.exports = mongoose.model('Farm', FarmSchema);