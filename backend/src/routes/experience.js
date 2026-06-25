const express = require('express');
const { body, validationResult } = require('express-validator');
const experienceController = require('../controllers/experience');
const verifyAdminToken = require('../middleware/auth');

const router = express.Router();

// Validation middleware for experience entries
const experienceValidators = [
  body('company').notEmpty().withMessage('Company is required.').trim(),
  body('role').notEmpty().withMessage('Role/Title is required.').trim(),
  body('startDate').isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD).'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD).'),
  body('isCurrent').optional().isBoolean().withMessage('isCurrent status must be a boolean.'),
  body('description').notEmpty().withMessage('Description achievements are required.').trim(),
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

// Public Route
router.get('/experience', experienceController.getExperiences);

// Admin Routes (Protected)
router.post('/admin/experience', verifyAdminToken, experienceValidators, experienceController.createExperience);
router.put('/admin/experience/:id', verifyAdminToken, experienceValidators, experienceController.updateExperience);
router.delete('/admin/experience/:id', verifyAdminToken, experienceController.deleteExperience);

module.exports = router;
