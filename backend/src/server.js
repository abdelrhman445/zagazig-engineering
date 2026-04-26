// Load environment variables FIRST, before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');
const errorHandler = require('./middleware/errorHandler');

// -------------------------------------------------------
// Connect to MongoDB
// -------------------------------------------------------
connectDB();

// -------------------------------------------------------
// Initialize Express App
// -------------------------------------------------------
const app = express();

// -------------------------------------------------------
// Global Middleware
// -------------------------------------------------------

// CORS — configure allowed origins for your frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Parse incoming JSON request bodies
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------
// Health Check Route
// -------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎓 Welcome to the Zag Drives API!',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy and running.',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------
// API Routes
// -------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);

// -------------------------------------------------------
// 404 Handler — Catch unmatched routes
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// -------------------------------------------------------
// Global Error Handler (must be last middleware)
// -------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Zag Drives API is running`);
  console.log(`   ➜ Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ➜ Port:    ${PORT}`);
  console.log(`   ➜ URL:     http://localhost:${PORT}\n`);
});

// -------------------------------------------------------
// Handle Unhandled Promise Rejections & Uncaught Exceptions
// -------------------------------------------------------
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'Reason:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
