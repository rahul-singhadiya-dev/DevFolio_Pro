const express = require('express');
const dashboardController = require('../controllers/dashboard');
const verifyAdminToken = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/dashboard
router.get('/', verifyAdminToken, dashboardController.getStats);

module.exports = router;
