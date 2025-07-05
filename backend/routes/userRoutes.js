const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// ======================
// AUTHENTICATION ROUTES
// ======================

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Password reset flow
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.patch('/reset-password/:token', authController.resetPassword);

// ======================
// PROTECTED ROUTES
// ======================
// All routes after this middleware are protected (require authentication)
router.use(authController.protect);

// User profile routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);
router.patch('/update-password', authController.updatePassword);

// ======================
// ADMIN ROUTES
// ======================
// Only users with admin role can access these routes
router.use(authController.restrictTo('admin'));

// User management routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
