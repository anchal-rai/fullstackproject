const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../middleware/errorHandler').AppError;
const sendEmail = require('../utils/email');
const { StatusCodes } = require('http-status-codes');

// Utility functions
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access.',
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token no longer exists.',
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, userType, phone } = req.body;
    
    // 1) Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new AppError('Email already in use', StatusCodes.BAD_REQUEST)
      );
    }

    // 2) Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      userType,
      phone
    });

    // 3) Send welcome email
    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Welcome to HomeService Pro!',
        message: `Hi ${newUser.name},\n        Welcome to HomeService Pro! Your account has been successfully created as a ${newUser.userType}.\n\nThank you for joining us!`
      });
    } catch (err) {
      // Don't block the registration process if email sending fails
      console.error('Error sending welcome email:', err);
    }

    createSendToken(newUser, StatusCodes.CREATED, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(
        new AppError('Please provide email and password!', StatusCodes.BAD_REQUEST)
      );
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError('Incorrect email or password', StatusCodes.UNAUTHORIZED)
      );
    }

    // 3) If everything ok, send token to client
    createSendToken(user, StatusCodes.OK, res);
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('There is no user with that email address.', StatusCodes.NOT_FOUND)
      );
    }

    // 2) Generate OTP and set expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    user.passwordResetExpires = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // 3) Send OTP to user's email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset OTP (valid for 10 minutes)',
        message: `Hi ${user.name},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`
      });

      res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'OTP sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(
        new AppError('Please provide email and OTP', StatusCodes.BAD_REQUEST)
      );
    }

    // 1) Get user based on the email and check OTP
    const hashedToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('OTP is invalid or has expired', StatusCodes.BAD_REQUEST));
    }

    // 2) Generate a reset token that will be used to reset the password
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).json({
      status: 'success',
      resetToken,
      message: 'OTP verified. You can now reset your password.'
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!token) {
      return next(
        new AppError('Please provide the reset token', StatusCodes.BAD_REQUEST)
      );
    }

    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', StatusCodes.BAD_REQUEST));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    // 3) Send confirmation email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Changed Successfully',
        message: `Hi ${user.name},\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact our support team immediately.`
      });
    } catch (err) {
      console.error('Error sending password change confirmation email:', err);
      // Don't fail the request if email sending fails
    }

    // 4) Log the user in, send JWT
    createSendToken(user, StatusCodes.OK, res);
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(
        new AppError('Your current password is wrong.', StatusCodes.UNAUTHORIZED)
      );
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!


    // 4) Log user in, send JWT
    createSendToken(user, StatusCodes.OK, res);
  } catch (err) {
    next(err);
  }
};