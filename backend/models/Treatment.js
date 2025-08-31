const mongoose = require('mongoose');
const crypto = require('crypto');

const TreatmentSchema = new mongoose.Schema({
  livestockGroupId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LivestockGroup', 
    required: true 
  },
  drugId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Drug', 
    required: true 
  },
  dosage: { type: String, required: true },
  dateAdministered: { type: Date, required: true, default: Date.now },
  administeredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  // REMOVE required: true from these fields
  withdrawalEndDate: { type: Date },
  dataHash: { type: String },
  // Denormalized data for easier queries
  drugName: String,
  groupName: String,
  species: String
}, {
  timestamps: true
});

// Calculate withdrawal date and generate hash before saving
TreatmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      console.log('Running pre-save middleware for new treatment...');
      
      const drug = await mongoose.model('Drug').findById(this.drugId);
      const group = await mongoose.model('LivestockGroup').findById(this.livestockGroupId);
      
      if (!drug) {
        return next(new Error('Drug not found'));
      }
      if (!group) {
        return next(new Error('Livestock group not found'));
      }

      // Calculate withdrawal end date
      const withdrawalEnd = new Date(this.dateAdministered);
      withdrawalEnd.setDate(withdrawalEnd.getDate() + drug.withdrawalPeriod);
      this.withdrawalEndDate = withdrawalEnd;

      // Add denormalized data
      this.drugName = drug.name;
      this.groupName = group.name;
      this.species = group.species;

      // Generate blockchain-like hash
      const dataString = `${this.livestockGroupId}${this.drugId}${this.dateAdministered}${this.dosage}${Date.now()}`;
      this.dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

      console.log('Middleware completed successfully');
      console.log('Withdrawal End Date:', this.withdrawalEndDate);
      console.log('Data Hash:', this.dataHash.substring(0, 10) + '...');
      
      next();
    } catch (error) {
      console.error('Error in pre-save middleware:', error);
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Treatment', TreatmentSchema);