const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const { generateSecret, generateURI, verify } = require('otplib');
const QRCode = require('qrcode');

const sendEmail = require('../utils/sendEmail');
const resetPasswordEmail = require('../utils/resetPasswordEmail');

const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Subscription = require('../models/subscriptionModel');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'users'));
  },

  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${extension}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload an image'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    status: 'fail',
    message
  });
};

function handleDatabaseError(error, res) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return sendError(res, 400, `This ${field} is already in use`);
  };

  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)[0].message;
    return sendError(res, 400, message);
  };

  return sendError(res, 400, error.message);
};

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 400, 'All fields are required');
  };

  try {
    const newUser = await User.create({ name, email, password });

    return res.status(201).json({
      status: 'success',
      message: 'Signed up successfully...',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profile: newUser.profile
        }
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  };
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'All fields are required');
  };

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 400, 'Invalid email or password');
    };

    const passwordCompare = await user.comparePassword(password);
    if (!passwordCompare) {
      return sendError(res, 400, 'Invalid email or password');
    };

    if (user.twoFactorEnabled) {
      const twoFactorToken = jwt.sign({
        id: user._id,
        purpose: '2fa-login'
      }, process.env.JWT_KEY, {
        expiresIn: '3m'
      });

      return res.status(200).json({
        status: '2fa_required',
        message: 'Two-factor authentication is required...',
        data: {
          twoFactorToken
        }
      });
    };

    const token = signToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful..',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return handleDatabaseError(error, res);
  };
};

exports.verifyTwoFactorLogin = async (req, res) => {
  const { token, twoFactorToken } = req.body;

  if (!token || !twoFactorToken) {
    return sendError(res, 400, 'OTP code and two-factor token are required');
  };

  try {
    const decoded = jwt.verify(twoFactorToken, process.env.JWT_KEY);
    if (decoded.purpose !== '2fa-login') {
      return sendError(res, 401, 'Invalid two-factor token');
    };

    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return sendError(res, 400, 'Two-factor authentication is not enabled');
    };

    const result = await verify({ secret: user.twoFactorSecret, token });
    if (!result.valid) {
      return sendError(res, 400, 'Incorrect OTP code');
    };

    const authToken = signToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token: authToken
      }
    });
  } catch (error) {
    console.error('2FA login verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Two-factor session has expired. Please login again');
    };

    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 400, 'Invalid two-factor-session. Please login again');
    };

    return handleDatabaseError(error, res);
  };
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    const header = req.headers.authorization;

    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    };

    if (!token) {
      return sendError(res, 401, 'Please log in to get access');
    };

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'This user does not longer exist');
    };

    if (user.passwordChangedAt) {
      if (Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat) {
        return sendError(res, 401, 'Password was changed recently. Please log in again');
      };
    };

    req.user = user;

    next();
  } catch (error) {
    return sendError(res, 401, 'Your session has expired or is invalid');
  };
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return sendError(res, 400, 'All fields are required');
  };

  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      name, email
    }, {
      runValidators: true,
      returnDocument: 'after'
    });

    return res.status(200).json({
      status: 'success',
      message: 'Updated successfully...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  };
};

exports.uploadProfile = upload.single('profile');

exports.updateProfilePhoto = async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'Select a profile image');
  };

  try {
    const oldProfile = req.user.profile;

    const user = await User.findByIdAndUpdate(req.user._id, {
      profile: req.file.filename
    }, {
      runValidators: true,
      returnDocument: 'after'
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    if (oldProfile !== 'user-default.png') {
      const oldPhotoPath = path.join(__dirname, '..', 'public', 'uploads', 'users', oldProfile);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      };
    };

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

exports.removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    if (user.profile === 'user-default.png') {
      return sendError(res, 400, 'You do not have a profile photo to remove');
    };

    const oldPhotoPath = path.join(__dirname, '..', 'public', 'uploads', 'users', user.profile);

    if (fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath);
    };

    user.profile = 'user-default.png';
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile removed...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return sendError(res, 400, 'All fields are required');
  };

  if (newPassword !== confirmPassword) {
    return sendError(res, 400, 'Passwords do not match');
  };

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    const checkPassword = await user.comparePassword(currentPassword);
    if (!checkPassword) {
      return sendError(res, 400, 'Current password is not correct');
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password updated...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 400, 'Provide your email');
  };

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 200, 'Password reset instructions have been sent if the email exists');
    };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Reset your password',
      message: `Reset your password using this link: ${resetURL}`,
      html: resetPasswordEmail(resetURL)
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password reset instructions have been sent if the email exists.'
    });
  } catch (error) {
    console.error('Password forgot verification:', error);
    return sendError(res, 500, 'Unable to perform this action');
  };
};

exports.forgotPasswordTwoFactor = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return sendError(res, 400, 'Email and OTP code are required');
  };

  try {
    const user = await User.findOne({ email }).select('+twoFactorSecret');

    if (!user) {
      return sendError(res, 400, 'Unable to verify the recovery request');
    };

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return sendError(res, 400, 'Unable to verify the recovery request');
    };

    const result = await verify({
      secret: user.twoFactorSecret,
      token
    });

    if (!result.valid) {
      return sendError(res, 400, 'Incorrect OTP code');
    };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully...',
      data: { token: resetToken }
    });
  } catch (error) {
    console.error('Two-factor password recovery:', error);
    return handleDatabaseError(error, res);
  };
};

exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return sendError(res, 400, 'All fields are required');
  };

  if (newPassword !== confirmPassword) {
    return sendError(res, 400, 'Passwords do not match');
  };

  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, 400, 'Password reset token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return handleDatabaseError(error, res);
  };
};

exports.validateResetToken = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, 400, 'Password reset link is invalid or expired');
    };

    return res.status(200).json({
      status: 'success',
      message: 'Password reset link is valid...'
    });
  } catch (error) {
    console.error('Validate reset token error:', error);
    return handleDatabaseError(error, res);
  };
};

exports.setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    if (user.twoFactorEnabled) {
      return sendError(res, 400, 'Two-factor authentication is already enabled');
    };

    let secret = user.twoFactorSecret;
    if (!secret) {
      secret = generateSecret();
      user.twoFactorSecret = secret;
      await user.save();
    };

    const uri = generateURI({
      secret,
      issuer: "Smith's Task Manager",
      label: user.email
    });
    const qrCode = await QRCode.toDataURL(uri);

    user.twoFactorSecret = secret;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Two factor setup initialized...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          twoFactorEnabled: user.twoFactorEnabled
        },
        qrCode
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  };
};

exports.verifyTwoFactor = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return sendError(res, 400, 'Provide the otp code');
  };

  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    if (user.twoFactorEnabled) {
      return sendError(res, 400, 'Two-factor authentication is already enabled');
    };

    if (!user.twoFactorSecret) {
      return sendError(res, 400, 'Two-factor setup has not been initialized');
    };

    const result = await verify({
      secret: user.twoFactorSecret,
      token
    });

    if (!result.valid) {
      return sendError(res, 400, 'Incorrect OTP code');
    };

    user.twoFactorEnabled = true;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Otp verified...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          twoFactorEnabled: user.twoFactorEnabled
        }
      }
    });
  } catch (error) {
    console.error('Two-factor verification failed:', error);
    return sendError(res, 500, 'Unable to verify the code');
  };
};

exports.disableTwoFactor = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return sendError(res, 400, 'Provide the otp code');
  }

  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    if (!user.twoFactorEnabled) {
      return sendError(res, 400, 'Two-factor authentication is already disabled');
    };

    if (!user.twoFactorSecret) {
      return sendError(res, 400, 'Two-factor secret is missing');
    };

    const result = await verify({
      secret: user.twoFactorSecret,
      token
    });

    if (!result.valid) {
      return sendError(res, 400, 'Incorrect OTP code');
    };

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Two-factor disabled successfully...',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          twoFactorEnabled: user.twoFactorEnabled
        }
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  };
};

exports.terminateAccount = async (req, res) => {
  const { password, token } = req.body;

  if (!password) {
    return sendError(res, 400, 'Password is required');
  };

  try {
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');

    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    const correctPassword = await user.comparePassword(password);

    if (!correctPassword) {
      return sendError(res, 400, 'Incorrect password');
    };

    if (user.twoFactorEnabled) {
      if (!token) {
        return sendError(res, 400, 'OTP code is required');
      };

      const result = await verify({
        secret: user.twoFactorSecret,
        token
      });

      if (!result.valid) {
        return sendError(res, 400, 'Incorrect OTP code');
      };
    };

    await Task.deleteMany({ user: user._id });

    await Subscription.deleteMany({ user: user._id });

    if (user.profile && user.profile !== 'user-default.png') {
      const photoPath = path.join(__dirname, '..', 'public', 'uploads', 'users', user.profile);

      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      };
    };

    await user.deleteOne();

    return res.status(200).json({
      status: 'success',
      message: 'Account terminated...'
    });
  } catch (error) {
    console.error('Terminate account error:', error);
    return handleDatabaseError(error, res);
  };
};

exports.verifyAccountPassword = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return sendError(res, 400, 'Password is required');
  };

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    };

    const correctPassword = await user.comparePassword(password);

    if (!correctPassword) {
      return sendError(res, 400, 'Incorrect password');
    };

    return res.status(200).json({
      status: 'success',
      message: 'Password verified'
    });
  } catch (error) {
    console.error('Verify password error:', error);
    return sendError(res, 500, 'Unable to verify the password');
  };
};