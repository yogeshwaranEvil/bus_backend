const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 12;
const PEPPER = process.env.PEPPER || 'someStaticSecret';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phoneNumber: {
      type: String,
      trim: true,
      match: /^\+?[1-9]\d{1,14}$/,
    },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    refreshTokens: [{ token: { type: String }, expiresAt: { type: Date } }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password + PEPPER, salt);
  next();
});

// 🔍 Compare passwords securely
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword + PEPPER, this.password);
};

// 🔑 Generate secure password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Exclude deleted users from queries
userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('User', userSchema);
