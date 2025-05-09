const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false
  },
  phone_number: {
    type: String,
    required: [true, 'Please enter your phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'provider'],
    required: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // location: { // Commented out to temporarily disable geolocation
  //   type: {
  //     type: String,
  //     default: 'Point',
  //     enum: ['Point']
  //   },
  //   coordinates: [Number]
  // },
  address: String
});

// Geospatial index for location-based queries - Commented out
// userSchema.index({ location: '2dsphere' });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password verification method
userSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');

  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiration (e.g., 10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

  // Return the unhashed token to send to the user
  return resetToken; 
};


module.exports = mongoose.model('User', userSchema);
