const express = require('express');
const { body, validationResult } = require('express-validator');
const messagesController = require('../controllers/messages');
const verifyAdminToken = require('../middleware/auth');

const router = express.Router();

// Validation middleware for message creation
const messageValidators = [
  body('name').notEmpty().withMessage('Please enter your name.').trim(),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('subject').notEmpty().withMessage('Subject is required.').trim(),
  body('message')
    .isLength({ min: 20 })
    .withMessage('Message must be at least 20 characters.')
    .trim(),
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

// Public Route - Submit Contact Form
router.post('/contact', messageValidators, messagesController.submitMessage);

// Admin Routes (Protected)
router.get('/admin/messages', verifyAdminToken, messagesController.getMessages);
router.put('/admin/messages/:id', verifyAdminToken, messagesController.markMessageRead);
router.delete('/admin/messages/:id', verifyAdminToken, messagesController.deleteMessage);

module.exports = router;
