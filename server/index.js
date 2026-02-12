const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Load environment variables
dotenv.config();

const app = express();

// Trust Vercel's reverse proxy (required for serverless deployment)
// Use '1' to trust first proxy, which is safer than 'true'
app.set('trust proxy', 1);

// =====================================================
// Security Middleware - Production Grade
// =====================================================

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Enable compression for responses
app.use(compression());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window default
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health',
  // Validate prevents the trust proxy error
  validate: { trustProxy: false }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10, // 10 attempts per hour default
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour.'
  },
  validate: { trustProxy: false }
});
app.use('/api/auth/login', authLimiter);

// =====================================================
// CORS Configuration - Production Ready
// =====================================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5000',
  // Add your Vercel deployment URLs here
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// =====================================================
// Middleware Configuration
// =====================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware - configurable via LOG_LEVEL
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan(process.env.LOG_LEVEL || 'dev'));
} else if (process.env.LOG_LEVEL) {
  app.use(morgan(process.env.LOG_LEVEL));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =====================================================
// Passport.js Configuration for Google OAuth
// (Session + Passport scoped to /api/users only)
// =====================================================
const passport = require('./config/passport');
const session = require('express-session');

const oauthSession = session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
});

// Create a mini-router that applies session + passport only to user/OAuth routes
const oauthMiddleware = [oauthSession, passport.initialize(), passport.session()];

// =====================================================
// MongoDB Connection - Production Grade for Vercel
// =====================================================

// Cache the database connection for serverless environments
let cachedConnection = null;

const mongooseOptions = {
  // =====================================================
  // OPTIMIZED CONNECTION POOL - Fast & Efficient
  // =====================================================
  maxPoolSize: 15,                    // Balanced pool size for serverless
  minPoolSize: 2,                     // Minimum connections ready
  
  // =====================================================
  // OPTIMIZED TIMEOUTS - Faster Failover
  // =====================================================
  serverSelectionTimeoutMS: 5000,     // Fast server selection (was 15s)
  socketTimeoutMS: 30000,             // Socket timeout (was 45s)
  connectTimeoutMS: 5000,             // Fast initial connect (was 30s)
  heartbeatFrequencyMS: 5000,         // More frequent health checks (was 10s)
  
  // =====================================================
  // WRITE/READ OPTIMIZATION
  // =====================================================
  retryWrites: true,                  // Retry failed writes automatically
  retryReads: true,                   // Retry failed reads automatically
  w: 'majority',                      // Write concern for data consistency
  readPreference: 'primaryPreferred', // Read from primary, fallback to secondary
  
  // =====================================================
  // CONNECTION STABILITY - KEEP ALIVE
  // =====================================================
  maxIdleTimeMS: 60000,               // Keep idle connections for 1 min (was 5 min)
  waitQueueTimeoutMS: 10000,          // Wait queue timeout
  
  // =====================================================
  // SERVERLESS & PERFORMANCE OPTIMIZATION
  // =====================================================
  bufferCommands: false,              // Fail fast instead of queuing when disconnected
  compressors: ['zlib'],              // Enable compression for faster data transfer
  
  // =====================================================
  // SECURITY - Prevent Data Leakage
  // =====================================================
  autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production
  family: 4,                          // Force IPv4 for consistent connections
};

// Connection promise for concurrent requests
let connectionPromise = null;

const connectDB = async () => {
  // Fast path: If already connected, return immediately
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If connection is in progress, wait for it (prevents multiple concurrent connections)
  if (connectionPromise) {
    return connectionPromise;
  }

  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI environment variable is required');
  }

  // Create connection promise for concurrent request handling
  connectionPromise = (async () => {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      const startTime = Date.now();
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
      
      cachedConnection = conn;
      const connectionTime = Date.now() - startTime;
      
      console.log(`✅ MongoDB connected in ${connectionTime}ms`);
      console.log(`📊 Database: ${conn.connection.name}`);
      console.log(`🌐 Host: ${conn.connection.host}`);
      
      return conn;
    } finally {
      connectionPromise = null; // Reset promise after connection attempt
    }
  })();

  try {
    return await connectionPromise;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Provide helpful error messages
    if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('💡 DNS Resolution failed. Check your MONGODB_URI format.');
    } else if (err.message.includes('Authentication failed')) {
      console.error('💡 Authentication failed. Check your username and password in MONGODB_URI.');
    } else if (err.message.includes('connect ETIMEDOUT')) {
      console.error('💡 Connection timed out. Ensure IP is whitelisted in MongoDB Atlas.');
      console.error('   Go to: MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0');
    }
    
    // In serverless, we should throw to indicate failure
    throw err;
  }
};

// MongoDB connection event handlers with auto-reconnect
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 3000; // 3 seconds initial delay
let isReconnecting = false;

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB Atlas');
  reconnectAttempts = 0; // Reset on successful connection
  isReconnecting = false;
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
  // Don't clear cache on temporary errors
  if (err.message.includes('ECONNRESET') || err.message.includes('timed out')) {
    console.log('⚠️ Temporary connection error, will auto-reconnect...');
  } else {
    cachedConnection = null;
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
  cachedConnection = null;
  
  // Auto-reconnect logic with exponential backoff
  if (!isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    isReconnecting = true;
    reconnectAttempts++;
    // Exponential backoff: 3s, 6s, 12s, etc. (max 30s)
    const delay = Math.min(RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts - 1), 30000);
    console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay/1000}s...`);
    setTimeout(async () => {
      try {
        await connectDB();
      } catch (err) {
        console.error('Reconnection attempt failed:', err.message);
        isReconnecting = false;
      }
    }, delay);
  } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Max reconnection attempts reached. Manual intervention required.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  // In production, we might want to gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    console.error('Uncaught exception in production, continuing operation...');
  }
});

// Handle process termination gracefully
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Only set up shutdown handlers in non-serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// =====================================================
// Auto-create Admin User if not exists
// =====================================================
const createDefaultAdmin = async () => {
  try {
    const Admin = require('./models/Admin');
    
    // Check if admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dlcourse.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log('🔄 Creating default admin user...');
      const admin = new Admin({
        name: 'Dr. Shabbeer Basha',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'superadmin'
      });
      await admin.save();
      console.log('✅ Default admin created:', adminEmail);
    } else {
      console.log('✅ Admin user exists:', adminEmail);
    }
  } catch (error) {
    console.error('⚠️ Error checking/creating admin:', error.message);
  }
};

// Initialize database connection and create admin
const initializeApp = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();
  } catch (err) {
    console.error('Failed to initialize app:', err.message);
    // Don't exit in serverless - let individual requests handle connection
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

initializeApp();

// =====================================================
// OPTIMIZED Middleware - Fast DB Connection Check
// =====================================================
app.use(async (req, res, next) => {
  // Skip DB check for health endpoint to avoid overhead
  if (req.path === '/api/health') {
    return next();
  }
  
  try {
    // Fast path: Already connected
    const readyState = mongoose.connection.readyState;
    if (readyState === 1) {
      return next();
    }
    
    // Reconnect only if disconnected or disconnecting
    if (readyState === 0 || readyState === 3) {
      await connectDB();
    } else if (readyState === 2) {
      // Connection in progress, wait briefly
      await new Promise(resolve => setTimeout(resolve, 100));
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please retry.',
      retryAfter: 2
    });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const assignmentRoutes = require('./routes/assignments');
const taRoutes = require('./routes/teachingAssistants');
const tutorialRoutes = require('./routes/tutorials');
const prerequisiteRoutes = require('./routes/prerequisites');
const examRoutes = require('./routes/exams');
const resourceRoutes = require('./routes/resources');
const feedbackRoutes = require('./routes/feedback');
const userRoutes = require('./routes/users'); // User authentication routes

// API Routes
app.use('/api/auth', authRoutes); // Admin authentication
app.use('/api/users', oauthMiddleware[0], oauthMiddleware[1], oauthMiddleware[2], userRoutes); // User/Student auth & OAuth (session scoped here)
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teaching-assistants', taRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/prerequisites', prerequisiteRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/feedback', feedbackRoutes);

// =====================================================
// Health Check Endpoint - Production Grade
// =====================================================
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: 'unknown',
      readyState: mongoose.connection.readyState,
      readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
    }
  };

  try {
    // Check database connectivity with a simple operation
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      healthCheck.database.status = 'connected';
      healthCheck.database.name = mongoose.connection.name;
      healthCheck.database.host = mongoose.connection.host;
    } else {
      healthCheck.database.status = 'disconnected';
      healthCheck.status = 'DEGRADED';
    }
    
    res.status(healthCheck.status === 'OK' ? 200 : 503).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.database.status = 'error';
    healthCheck.database.error = error.message;
    res.status(503).json(healthCheck);
  }
});

// =====================================================
// Error Handling Middleware - Production Grade
// =====================================================
app.use((err, req, res, next) => {
  // Log error details
  console.error('🚨 Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// =====================================================
// Server Startup
// =====================================================
const PORT = process.env.PORT || 5000;

// Export for Vercel serverless
module.exports = app;

// Only start the server if not in serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}
