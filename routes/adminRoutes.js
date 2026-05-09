const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminController');
const { validateLogin } = require('../middleware/validation');

// POST /api/admin/login
router.post('/login', validateLogin, adminLogin);

module.exports = router;
