const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (email) {
        return validator.isEmail(email);
      },
      message: 'Provide a valid email.'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function (pwd) {
        const strength = zxcvbn(pwd);
        return strength.score >= 3;
      },
      message: 'Password is not strong enough'
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  profile: {
    type: String,
    default: 'user-default.png'
  },
  profilePublicId: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = new Date();
});

userSchema.methods.comparePassword = async function (userPwd) {
  return await bcrypt.compare(userPwd, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;