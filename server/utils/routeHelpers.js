/**
 * Route Utilities - Production Grade Error Handling & Async Wrappers
 * 
 * Best practices for MongoDB CRUD operations:
 * 1. Always use try-catch with proper error types
 * 2. Set operation timeouts to prevent hanging requests
 * 3. Validate ObjectIds before querying
 * 4. Return consistent error responses
 * 5. Log errors for debugging
 */

const mongoose = require('mongoose');

// =====================================================
// Async Handler - Wraps async route handlers
// =====================================================
/**
 * Wraps async express route handlers to automatically catch errors
 * and pass them to the Express error handler middleware.
 * 
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =====================================================
// Timeout Wrapper - Prevents hanging requests
// =====================================================
/**
 * Wraps a promise with a timeout to prevent indefinite hangs.
 * 
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds (default: 10000)
 * @param {string} operation - Operation name for error message
 */
const withTimeout = (promise, ms = 10000, operation = 'Operation') => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operation} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]);
};

// =====================================================
// ObjectId Validator
// =====================================================
/**
 * Validates if a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && 
         (new mongoose.Types.ObjectId(id)).toString() === id;
};

/**
 * Middleware to validate ObjectId params
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} format`,
      code: 'INVALID_ID'
    });
  }
  next();
};

// =====================================================
// Standard Response Helpers
// =====================================================

/**
 * Send success response with data
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send success response for lists with count
 */
const sendList = (res, data, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    count: Array.isArray(data) ? data.length : 0,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response with appropriate status code
 */
const sendError = (res, message, statusCode = 500, code = 'SERVER_ERROR') => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send not found response
 */
const sendNotFound = (res, resource = 'Resource') => {
  res.status(404).json({
    success: false,
    message: `${resource} not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

// =====================================================
// Error Handler Utility
// =====================================================

/**
 * Handles common MongoDB/Mongoose errors and returns appropriate responses
 */
const handleRouteError = (error, res, operation = 'Operation') => {
  console.error(`${operation} error:`, error.message);

  // Validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(e => e.message);
    return sendError(res, messages.join(', '), 400, 'VALIDATION_ERROR');
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400, 'INVALID_ID');
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return sendError(res, `Duplicate value for ${field}`, 400, 'DUPLICATE_KEY');
  }

  // Timeout error
  if (error.message?.includes('timed out')) {
    return sendError(res, 'Request timed out. Please try again.', 504, 'TIMEOUT');
  }

  // Connection error
  if (error.name === 'MongoNetworkError' || error.message?.includes('ECONNREFUSED')) {
    return sendError(res, 'Database connection error. Please try again.', 503, 'DB_CONNECTION_ERROR');
  }

  // Default server error
  return sendError(res, 'An unexpected error occurred', 500, 'SERVER_ERROR');
};

// =====================================================
// Query Helpers for Performance
// =====================================================

/**
 * Apply common query optimizations
 */
const optimizeQuery = (query, options = {}) => {
  const { 
    select = null, 
    limit = null, 
    sort = null,
    lean = true,
    timeout = 10000 
  } = options;

  if (select) query = query.select(select);
  if (sort) query = query.sort(sort);
  if (limit) query = query.limit(limit);
  if (lean) query = query.lean(); // Returns plain JS objects (faster)
  
  // Set query timeout
  query = query.maxTimeMS(timeout);
  
  return query;
};

// =====================================================
// Cache Control Middleware
// =====================================================

/**
 * Middleware to set Cache-Control headers for public GET routes.
 * Data like courses and lectures change infrequently, so a short
 * cache (5 min) reduces redundant DB queries significantly.
 * 
 * @param {number} maxAge - Cache duration in seconds (default: 300 = 5min)
 */
const cacheControl = (maxAge = 300) => (req, res, next) => {
  // Only cache GET requests
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
  }
  next();
};

module.exports = {
  asyncHandler,
  withTimeout,
  isValidObjectId,
  validateObjectId,
  sendSuccess,
  sendList,
  sendError,
  sendNotFound,
  handleRouteError,
  optimizeQuery,
  cacheControl
};
