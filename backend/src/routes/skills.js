const express = require('express');
const { body, validationResult } = require('express-validator');
const skillsController = require('../controllers/skills');
const verifyAdminToken = require('../middleware/auth');

const router = express.Router();

const skillCategories = ['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLS'];
const proficiencyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

// Validation middleware for skills
const skillValidators = [
  body('name').notEmpty().withMessage('Skill name is required.').trim(),
  body('category')
    .isIn(skillCategories)
    .withMessage(`Category must be one of: ${skillCategories.join(', ')}`),
  body('proficiency')
    .isIn(proficiencyLevels)
    .withMessage(`Proficiency must be one of: ${proficiencyLevels.join(', ')}`),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer.'),
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

// Public Routes
router.get('/skills', skillsController.getSkills);

// Admin Routes (Protected)
router.get('/admin/skills', verifyAdminToken, skillsController.getAdminSkills);
router.post('/admin/skills', verifyAdminToken, skillValidators, skillsController.createSkill);
router.put('/admin/skills/:id', verifyAdminToken, skillValidators, skillsController.updateSkill);
router.delete('/admin/skills/:id', verifyAdminToken, skillsController.deleteSkill);

module.exports = router;
