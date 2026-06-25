const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

// Input validation middleware for auth
const loginValidators = [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: errors.array()[0].msg,
        details: errors.array(),
      });
    }
    next();
  },
];

const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.'),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Please confirm your new password.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: errors.array()[0].msg,
        details: errors.array(),
      });
    }
    next();
  },
];

const verifyAdminToken = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', loginValidators, authController.login);

// GET /api/auth/verify (Protected)
router.get('/verify', verifyAdminToken, authController.verify);

// POST /api/auth/change-password (Protected)
router.post('/change-password', verifyAdminToken, changePasswordValidators, authController.changePassword);

module.exports = router;
