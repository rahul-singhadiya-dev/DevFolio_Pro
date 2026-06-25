const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image/file fetching for dev
}));

// 2. CORS Setup
const allowedOrigins = [
  // Always allow local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  // Production frontend URL (set this in your hosting env vars)
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin header)
    if (!origin) return callback(null, true);

    // Check against the whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development — allow everything
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production with no FRONTEND_URL set — allow everything (open CORS)
    // Set FRONTEND_URL on your host to restrict this
    if (!process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} blocked by CORS policy`));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// 3. Body Parsing Limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 4. Serve uploaded files statically
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 5. Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    error: true,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact messages per hour
  message: {
    error: true,
    message: 'Too many messages sent from this IP, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to specific endpoints
app.use('/api/auth/login', loginLimiter);
app.use('/api/contact', contactLimiter);

// 6. Router Registrations
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/dashboard', require('./routes/dashboard'));

// Unified mounting for endpoints containing internal paths
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/projects'));
app.use('/api', require('./routes/skills'));
app.use('/api', require('./routes/experience'));
app.use('/api', require('./routes/blog'));
app.use('/api', require('./routes/messages'));
app.use('/api', require('./routes/resume'));

// 7. Route 404 Fallback
app.use((req, res, next) => {
  res.status(404).json({
    error: true,
    message: `API Route not found: ${req.method} ${req.url}`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// 8. Global Error Handler
app.use(errorHandler);

module.exports = app;
