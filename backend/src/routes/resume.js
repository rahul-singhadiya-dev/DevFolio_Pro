const express = require('express');
const resumeController = require('../controllers/resume');

const router = express.Router();

// Public Route
router.get('/resume', resumeController.getResume);

module.exports = router;
