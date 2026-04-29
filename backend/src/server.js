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

/**
 * إعدادات الـ CORS المحدثة:
 * تم استخدام دالة التحقق لضمان تنظيف الروابط من المسافات الزائدة
 * وللسماح بالوصول من الفرونت إند المرفوع على Vercel بشكل آمن.
 */
const corsOptions = {
  origin: function (origin, callback) {
    // السماح بالطلبات التي ليس لها origin (مثل تطبيقات الموبايل أو Postman أو السيرفرات)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
      : [];

    // في وضع التطوير (development) اسمح بكل شيء، في الإنتاج (production) تحقق من القائمة المسموحة
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed by Zag Drives API`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // لضمان التوافق مع بعض المتصفحات القديمة
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
  console.log(`   ➜ Mode:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ➜ Port:     ${PORT}`);
  console.log(`   ➜ URL:      http://localhost:${PORT}\n`);
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
