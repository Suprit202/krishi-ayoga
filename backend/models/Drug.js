const mongoose = require('mongoose');

const DrugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a drug name'],
    unique: true,
    trim: true
  },
  price:{
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  manufacturera: String,
  defaultDosage: {
    type: String,
    required: [true, 'Please add a default dosage'],
    trim: true
  },
  withdrawalPeriod: {
    type: Number, // in days
    required: [true, 'Please add withdrawal period in days'],
    min: [0, 'Withdrawal period cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Drug', DrugSchema);