const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

const router = express.Router();

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token and user data
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // Successful authentication, redirect or send token
    const token = signToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&userId=${req.user._id}`);
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: false
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&userId=${req.user._id}`);
  }
);

// Twitter OAuth routes
router.get('/twitter',
  passport.authenticate('twitter')
);

router.get('/twitter/callback',
  passport.authenticate('twitter', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?token=${token}&userId=${req.user._id}`);
  }
);

module.exports = router;
