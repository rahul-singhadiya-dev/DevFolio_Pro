const express = require('express');
const { body, validationResult } = require('express-validator');
const projectsController = require('../controllers/projects');
const verifyAdminToken = require('../middleware/auth');

const router = express.Router();

// Input validation middleware for projects
const projectValidators = [
  body('title').notEmpty().withMessage('Title is required.').trim(),
  body('slug')
    .optional({ checkFalsy: true })
    .matches(/^[a-z0-9\-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens.')
    .trim(),
  body('shortDescription').notEmpty().withMessage('Short description is required.').trim(),
  body('fullDescription').notEmpty().withMessage('Full description is required.').trim(),
  body('techTags')
    .isArray({ min: 1 })
    .withMessage('At least one tech tag is required.'),
  body('liveUrl').optional({ checkFalsy: true }).isURL().withMessage('Live URL must be a valid URL.'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('GitHub URL must be a valid URL.'),
  body('thumbnailUrl').optional({ checkFalsy: true }).isURL().withMessage('Thumbnail URL must be a valid URL.'),
  body('published').optional().isBoolean().withMessage('Published status must be a boolean.'),
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
router.get('/projects', projectsController.getProjects);
router.get('/projects/:slug', projectsController.getProjectBySlug);

// Admin Routes (Protected)
router.get('/admin/projects', verifyAdminToken, projectsController.getAdminProjects);
router.post('/admin/projects', verifyAdminToken, projectValidators, projectsController.createProject);
router.put('/admin/projects/:id', verifyAdminToken, projectValidators, projectsController.updateProject);
router.delete('/admin/projects/:id', verifyAdminToken, projectsController.deleteProject);

module.exports = router;
