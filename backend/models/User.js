const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password in queries by default
  },
  
  role: {
    type: String,
    enum: ['farmer', 'veterinarian', 'admin'],
    default: 'farmer'
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  },
  ownedFarms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  }],
  farm: {
    name: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['dairy', 'poultry', 'swine', 'aquaculture', 'mixed'],
      default: 'mixed'
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    contact: {
      phone: String,
      alternatePhone: String,
      email: String
    },
    size: {
      type: Number, // in acres/hectares
      min: 0
    },
    establishedYear: Number,
    registrationId: String,
    description: String
  },
  profile: {
    phone: String,
    address: String,
    photo: String,
    experience: { // in years
      type: Number,
      min: 0
    },
    qualifications: [String],
    specialization: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
 }, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);