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
 * إعدادات الـ CORS الاحترافية:
 * 1. بننظف الروابط من أي "/" في الآخر.
 * 2. بنطبع القيم في الـ Logs عشان نتأكد إن Render قاري الـ Env صح.
 */
const corsOptions = {
  origin: function (origin, callback) {
    // السماح بالطلبات بدون origin (مثل Postman)
    if (!origin) return callback(null, true);

    // جلب الروابط وتنظيفها من المسافات والـ "/" الزائدة
    const rawAllowed = process.env.ALLOWED_ORIGINS || "";
    const allowedOrigins = rawAllowed.split(',')
      .map(url => url.trim().replace(/\/$/, ''));

    // تنظيف الرابط القادم للمقارنة
    const cleanedOrigin = origin.replace(/\/$/, '');

    // سطر للـ Debug في Render (هتلاقيه في الـ Logs بلون مختلف)
    console.log(`--- [CORS Check] ---`);
    console.log(`Incoming: ${cleanedOrigin}`);
    console.log(`Allowed List: ${JSON.stringify(allowedOrigins)}`);

    const isAllowed = process.env.NODE_ENV !== 'production' || allowedOrigins.includes(cleanedOrigin);
    
    if (isAllowed) {
      console.log(`✅ Access Granted`);
      callback(null, true);
    } else {
      console.error(`❌ Access Denied: ${origin} not in allowed list.`);
      callback(new Error(`❌ CORS Error: Origin ${origin} is not allowed by configuration.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Parse incoming JSON request bodies
app.use(express.json({ limit: '10kb' })); 

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------
// Health Check Routes
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
// 404 Handler
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// -------------------------------------------------------
// Global Error Handler
// -------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Zag Drives API is running`);
  console.log(`   ➜ Mode:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ➜ Port:      ${PORT}`);
  console.log(`   ➜ URL:       http://localhost:${PORT}\n`);
});

// -------------------------------------------------------
// Process Handlers
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
