const express = require('express');
const { body, validationResult } = require('express-validator');
const blogController = require('../controllers/blog');
const verifyAdminToken = require('../middleware/auth');

const router = express.Router();

// Validation middleware for blog posts
const blogValidators = [
  body('title').notEmpty().withMessage('Blog title is required.').trim(),
  body('slug')
    .optional({ checkFalsy: true })
    .matches(/^[a-z0-9\-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens.')
    .trim(),
  body('content').notEmpty().withMessage('Blog content cannot be empty.').trim(),
  body('excerpt').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings.'),
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
router.get('/blog', blogController.getBlogPosts);
router.get('/blog/:slug', blogController.getBlogPostBySlug);

// Admin Routes (Protected)
router.get('/admin/blog', verifyAdminToken, blogController.getAdminBlogPosts);
router.post('/admin/blog', verifyAdminToken, blogValidators, blogController.createBlogPost);
router.put('/admin/blog/:id', verifyAdminToken, blogValidators, blogController.updateBlogPost);
router.delete('/admin/blog/:id', verifyAdminToken, blogController.deleteBlogPost);

module.exports = router;
