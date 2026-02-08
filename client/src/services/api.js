import axios from 'axios';

// =====================================================
// API Configuration - Production Grade with Best Practices
// =====================================================

// Dynamically determine API URL based on environment
const getApiUrl = () => {
  // If running on Vercel/production, use relative URL (same origin)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // For development, check for env variable or use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// =====================================================
// Retry Configuration - Exponential Backoff
// =====================================================
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds max
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH', 'ERR_NETWORK']
};

// Calculate delay with exponential backoff and jitter
const getRetryDelay = (attempt) => {
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add up to 1s of random jitter
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelay);
};

// Sleep utility for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is retryable
const isRetryableError = (error) => {
  // Network errors
  if (!error.response) {
    return RETRY_CONFIG.retryableErrors.some(errCode => 
      error.code === errCode || error.message?.includes(errCode)
    );
  }
  // Server errors
  return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
};

// =====================================================
// Create Axios Instance with Optimized Settings
// =====================================================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000, // 15 second timeout (reduced for faster failure detection)
  // Validate response status
  validateStatus: (status) => status >= 200 && status < 300
});

// =====================================================
// Request Interceptor - Add Auth Token
// =====================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request timestamp for timing
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// Response Interceptor - Error Handling & Retry Logic
// =====================================================
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.debug(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    config.retryCount = config.retryCount || 0;
    
    // Check if we should retry
    if (config.retryCount < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
      config.retryCount++;
      const delay = getRetryDelay(config.retryCount);
      
      console.warn(`API Retry ${config.retryCount}/${RETRY_CONFIG.maxRetries} after ${Math.round(delay)}ms:`, 
        config.url, error.message);
      
      await sleep(delay);
      return api(config);
    }
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/admin/login')) {
          // Use a slight delay to allow any state updates
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 100);
        }
      }
      
      // Log meaningful error info
      console.error(`API Error [${status}]:`, message, config.url);
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network Error: No response from server. Please check your connection.');
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// =====================================================
// Client-Side API Cache - Avoids redundant GETs
// =====================================================
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cachedGet = (url, ttl = CACHE_TTL) => {
  const now = Date.now();
  const entry = apiCache.get(url);
  if (entry && now - entry.ts < ttl) {
    return Promise.resolve(entry.data);   // return cloned response shape
  }
  return api.get(url).then((res) => {
    apiCache.set(url, { data: res, ts: Date.now() });
    return res;
  });
};

// Invalidate cache entries that start with a given prefix
const invalidateCache = (prefix) => {
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) apiCache.delete(key);
  }
};

// =====================================================
// API Helper - Wrapper with Built-in Error Handling
// =====================================================
const safeApiCall = async (apiPromise, defaultValue = null) => {
  try {
    const response = await apiPromise;
    return { success: true, data: response.data, error: null };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'An unexpected error occurred';
    return { success: false, data: defaultValue, error: errorMessage };
  }
};

// =====================================================
// Authentication API
// =====================================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentAdmin: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  // Admin User Management
  getAllUsers: () => api.get('/users/admin/all'),
  deleteUser: (id) => api.delete(`/users/admin/${id}`),
  getUserStats: () => api.get('/users/admin/stats')
};

// =====================================================
// Course API - with safe wrapper option
// =====================================================
export const courseAPI = {
  getAll: () => cachedGet('/courses'),
  getAllSafe: () => safeApiCall(cachedGet('/courses'), { data: [] }),
  getById: (id) => cachedGet(`/courses/${id}`),
  create: (data) => api.post('/courses', data).then(r => { invalidateCache('/courses'); return r; }),
  update: (id, data) => api.put(`/courses/${id}`, data).then(r => { invalidateCache('/courses'); return r; }),
  delete: (id) => api.delete(`/courses/${id}`).then(r => { invalidateCache('/courses'); return r; })
};

// =====================================================
// Lecture API
// =====================================================
export const lectureAPI = {
  getByCourse: (courseId) => cachedGet(`/lectures/course/${courseId}`),
  getByCoursesSafe: (courseId) => safeApiCall(cachedGet(`/lectures/course/${courseId}`), { data: [] }),
  getAllByCourse: (courseId) => api.get(`/lectures/admin/course/${courseId}`),
  getById: (id) => cachedGet(`/lectures/${id}`),
  create: (data) => api.post('/lectures', data).then(r => { invalidateCache('/lectures'); return r; }),
  update: (id, data) => api.put(`/lectures/${id}`, data).then(r => { invalidateCache('/lectures'); return r; }),
  delete: (id) => api.delete(`/lectures/${id}`).then(r => { invalidateCache('/lectures'); return r; })
};

// =====================================================
// Assignment API
// =====================================================
export const assignmentAPI = {
  getByCourse: (courseId) => cachedGet(`/assignments/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/assignments/admin/course/${courseId}`),
  getById: (id) => cachedGet(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data).then(r => { invalidateCache('/assignments'); return r; }),
  update: (id, data) => api.put(`/assignments/${id}`, data).then(r => { invalidateCache('/assignments'); return r; }),
  delete: (id) => api.delete(`/assignments/${id}`).then(r => { invalidateCache('/assignments'); return r; })
};

// =====================================================
// Tutorial API
// =====================================================
export const tutorialAPI = {
  getByCourse: (courseId) => cachedGet(`/tutorials/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/tutorials/admin/course/${courseId}`),
  getById: (id) => cachedGet(`/tutorials/${id}`),
  create: (data) => api.post('/tutorials', data).then(r => { invalidateCache('/tutorials'); return r; }),
  update: (id, data) => api.put(`/tutorials/${id}`, data).then(r => { invalidateCache('/tutorials'); return r; }),
  delete: (id) => api.delete(`/tutorials/${id}`).then(r => { invalidateCache('/tutorials'); return r; })
};

// =====================================================
// Prerequisite API
// =====================================================
export const prerequisiteAPI = {
  getByCourse: (courseId) => cachedGet(`/prerequisites/course/${courseId}`),
  create: (data) => api.post('/prerequisites', data).then(r => { invalidateCache('/prerequisites'); return r; }),
  update: (id, data) => api.put(`/prerequisites/${id}`, data).then(r => { invalidateCache('/prerequisites'); return r; }),
  delete: (id) => api.delete(`/prerequisites/${id}`).then(r => { invalidateCache('/prerequisites'); return r; })
};

// =====================================================
// Exam API
// =====================================================
export const examAPI = {
  getByCourse: (courseId) => cachedGet(`/exams/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/exams/admin/course/${courseId}`),
  getById: (id) => cachedGet(`/exams/${id}`),
  create: (data) => api.post('/exams', data).then(r => { invalidateCache('/exams'); return r; }),
  update: (id, data) => api.put(`/exams/${id}`, data).then(r => { invalidateCache('/exams'); return r; }),
  delete: (id) => api.delete(`/exams/${id}`).then(r => { invalidateCache('/exams'); return r; })
};

// =====================================================
// Resource API
// =====================================================
export const resourceAPI = {
  getByCourse: (courseId, category) => {
    const url = category 
      ? `/resources/course/${courseId}?category=${category}`
      : `/resources/course/${courseId}`;
    return cachedGet(url);
  },
  create: (data) => api.post('/resources', data).then(r => { invalidateCache('/resources'); return r; }),
  update: (id, data) => api.put(`/resources/${id}`, data).then(r => { invalidateCache('/resources'); return r; }),
  delete: (id) => api.delete(`/resources/${id}`).then(r => { invalidateCache('/resources'); return r; })
};

// =====================================================
// Teaching Assistant API
// =====================================================
export const taAPI = {
  getByCourse: (courseId) => cachedGet(`/teaching-assistants/course/${courseId}`),
  getById: (id) => cachedGet(`/teaching-assistants/${id}`),
  create: (data) => api.post('/teaching-assistants', data).then(r => { invalidateCache('/teaching-assistants'); return r; }),
  update: (id, data) => api.put(`/teaching-assistants/${id}`, data).then(r => { invalidateCache('/teaching-assistants'); return r; }),
  delete: (id) => api.delete(`/teaching-assistants/${id}`).then(r => { invalidateCache('/teaching-assistants'); return r; })
};

// =====================================================
// User/Student Authentication API
// =====================================================
export const userAPI = {
  // Registration & Login
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  
  // Profile - with optional token override for student auth
  getMe: (token) => {
    if (token) {
      return api.get('/users/me', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
    }
    return api.get('/users/me');
  },
  updateProfile: (data, token) => {
    if (token) {
      return api.put('/users/profile', data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
    }
    return api.put('/users/profile', data);
  },
  changePassword: (data, token) => {
    if (token) {
      return api.put('/users/change-password', data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
    }
    return api.put('/users/change-password', data);
  },
  
  // Password Reset
  forgotPassword: (data) => api.post('/users/forgot-password', data),
  resetPassword: (token, data) => api.post(`/users/reset-password/${token}`, data),
  
  // Email Verification
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  resendVerification: (authToken) => {
    if (authToken) {
      return api.post('/users/resend-verification', {}, { 
        headers: { Authorization: `Bearer ${authToken}` } 
      });
    }
    return api.post('/users/resend-verification');
  },
  
  // Google OAuth - These will redirect, not return data
  googleLogin: () => {
    window.location.href = `${API_URL}/users/google`;
  }
};

// Export safe API call helper for use in components
export { safeApiCall, invalidateCache };
export default api;
