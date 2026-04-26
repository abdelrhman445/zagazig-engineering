const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login  → Authenticate admin and receive JWT
router.post('/login', login);

// GET /api/auth/me  → Get current logged-in admin profile (protected)
router.get('/me', protect, getMe);

module.exports = router;
