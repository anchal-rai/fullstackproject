const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      trim: true,
      maxlength: [50, 'Name must be less than 50 characters'],
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    userType: {
      type: String,
      enum: ['maid', 'customer'],
      required: [true, 'Please specify user type (maid/customer)'],
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional for OAuth users
          return /^\+?[1-9]\d{9,14}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    password: {
      type: String,
      required: [
        function() { return !(this.googleId || this.facebookId || this.twitterId); },
        'Password is required for non-OAuth users'
      ],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [
        function() { return !(this.googleId || this.facebookId || this.twitterId) && this.isNew; },
        'Please confirm your password'
      ],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          if (this.googleId || this.facebookId || this.twitterId) return true;
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    // OAuth Provider Fields
    googleId: String,
    facebookId: String,
    twitterId: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Document Middleware: runs before .save() and .create()
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Ensure the token is created after the password has been changed
  next();
});

// Query Middleware
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance method - Available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;