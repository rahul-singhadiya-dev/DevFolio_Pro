const express = require('express');
const { body, validationResult } = require('express-validator');
const profileController = require('../controllers/profile');
const verifyAdminToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation middleware for updating profile
const updateProfileValidators = [
  body('fullName').notEmpty().withMessage('Full Name is required.').trim(),
  body('title').notEmpty().withMessage('Title/Role is required.').trim(),
  body('bio')
    .notEmpty().withMessage('Bio is required.')
    .isLength({ max: 300 }).withMessage('Bio must be under 300 characters.')
    .trim(),
  body('avatarUrl').optional({ checkFalsy: true }).isURL().withMessage('Avatar must be a valid URL.'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('GitHub link must be a valid URL.'),
  body('linkedinUrl').optional({ checkFalsy: true }).isURL().withMessage('LinkedIn link must be a valid URL.'),
  body('twitterUrl').optional({ checkFalsy: true }).isURL().withMessage('Twitter link must be a valid URL.'),
  body('resumeUrl').optional({ checkFalsy: true }).isURL().withMessage('Resume URL must be a valid URL.'),
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

// Public route to view profile
router.get('/profile', profileController.getProfile);

// Admin routes (Protected)
router.put('/admin/profile', verifyAdminToken, updateProfileValidators, profileController.updateProfile);
router.post('/admin/profile/resume', verifyAdminToken, upload.single('resume'), profileController.uploadResume);

module.exports = router;
