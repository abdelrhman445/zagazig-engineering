const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// -------------------------------------------------------
// Helper: Sign and return a JWT
// -------------------------------------------------------
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// -------------------------------------------------------
// @desc    Login admin and receive JWT
// @route   POST /api/auth/login
// @access  Public
// -------------------------------------------------------
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Validate that both fields are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    // 2. Find admin by username — explicitly select password (it's excluded by default)
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      // Use a generic message to avoid username enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // 3. Compare submitted password with stored hash
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // 4. Generate JWT
    const token = signToken(admin._id);

    // 5. Send response (never send the password back)
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        admin: {
          id: admin._id,
          username: admin.username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------
// @desc    Get currently authenticated admin profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// -------------------------------------------------------
const getMe = async (req, res, next) => {
  try {
    // req.admin is attached by authMiddleware
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
