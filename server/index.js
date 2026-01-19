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
app.set('trust proxy', true);

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
  skip: (req) => req.path === '/api/health'
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
  }
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
// MongoDB Connection - Production Grade for Vercel
// =====================================================

// Cache the database connection for serverless environments
let cachedConnection = null;

const mongooseOptions = {
  // Connection pool settings for serverless
  maxPoolSize: 10,                    // Maximum number of connections in the pool
  minPoolSize: 2,                     // Minimum number of connections
  serverSelectionTimeoutMS: 10000,    // Timeout for server selection (10s)
  socketTimeoutMS: 45000,             // Timeout for socket operations (45s)
  heartbeatFrequencyMS: 10000,        // Frequency of heartbeat checks
  retryWrites: true,                  // Retry failed writes
  retryReads: true,                   // Retry failed reads
  w: 'majority',                      // Write concern for data safety
  // Serverless optimization
  bufferCommands: false,              // Disable buffering for faster error detection
  maxIdleTimeMS: 30000,               // Close connections idle for 30s (important for serverless)
};

const connectDB = async () => {
  // If we have a cached connection and it's connected, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('📦 Using cached MongoDB connection');
    return cachedConnection;
  }

  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    cachedConnection = conn;
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState}`);
    
    return conn;
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

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
  cachedConnection = null; // Clear cache on disconnect
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
// Middleware to ensure DB connection for each request
// =====================================================
app.use(async (req, res, next) => {
  try {
    // Check if connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Reconnecting to MongoDB...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teaching-assistants', taRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/prerequisites', prerequisiteRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/resources', resourceRoutes);

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
