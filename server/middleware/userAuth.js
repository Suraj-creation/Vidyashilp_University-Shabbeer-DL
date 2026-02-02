const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Cache for user lookups (5 minute cache)
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Clear stale cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      userCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

const userAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.slice(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }
      throw jwtError;
    }
    
    // Check if this is a user token (not admin)
    if (decoded.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type. User access required.'
      });
    }

    // Check cache first
    const cacheKey = `user_${decoded.id}`;
    const cached = userCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      req.user = cached.user;
      return next();
    }

    // Find user
    const user = await User.findById(decoded.id).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }

    // Cache the user
    userCache.set(cacheKey, {
      user,
      timestamp: Date.now()
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('User auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Function to invalidate cache when user data changes
userAuth.invalidateCache = (userId) => {
  if (userId) {
    userCache.delete(`user_${userId.toString()}`);
  }
};

module.exports = userAuth;
