const mongoose = require('mongoose');

const LivestockGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true
  },
  species: {
    type: String,
    required: [true, 'Please specify species'],
    enum: ['Cattle', 'Poultry', 'Swine', 'Sheep', 'Goat', 'Fish'],
    trim: true
  },
  count: {
    type: Number,
    required: [true, 'Please add animal count'],
    min: [1, 'Count must be at least 1']
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  status: {
    type: String,
    enum: ['healthy', 'under_treatment', 'ready_for_sale', 'quarantined'],
    default: 'healthy'
  },
  currentTreatments: [{
    drugName: String,
    dateAdministered: Date,
    withdrawalEndDate: Date,
    _id: false
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('LivestockGroup', LivestockGroupSchema);