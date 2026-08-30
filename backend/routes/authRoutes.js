const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many attempts'
  }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many verification attempts'
  }
});

const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many password recovery requests'
  }
});

router.get('/validate/reset-password/:token', authController.validateResetToken);

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);
router.post('/verify-login', authController.verifyTwoFactorLogin);
router.post('/forgot-password', recoveryLimiter, authController.forgotPassword);
router.post('/forgot-password/two-factor', otpLimiter, authController.forgotPasswordTwoFactor);

router.patch('/reset-password/:token', authController.resetPassword);

router.use(authController.protect);

router.post('/enable/two-factor', authController.setupTwoFactor);
router.post('/verify-two-factor', otpLimiter, authController.verifyTwoFactor);
router.post('/verify-account-password', authController.verifyAccountPassword);

router.patch('/disable/two-factor', authController.disableTwoFactor);
router.patch('/update', authController.updateProfile);
router.patch('/update-profile-image', authController.uploadProfile, authController.updateProfilePhoto);
router.patch('/change-password', authController.changePassword);

router.delete('/remove-profile-image', authController.removeProfilePhoto);
router.delete('/terminate-account', authController.terminateAccount);

module.exports = router;