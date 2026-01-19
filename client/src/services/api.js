import axios from 'axios';

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

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
      console.error('API Error:', error.response.data?.message || error.message);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentAdmin: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Course API
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`)
};

// Lecture API
export const lectureAPI = {
  getByCourse: (courseId) => api.get(`/lectures/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/lectures/admin/course/${courseId}`),
  getById: (id) => api.get(`/lectures/${id}`),
  create: (data) => api.post('/lectures', data),
  update: (id, data) => api.put(`/lectures/${id}`, data),
  delete: (id) => api.delete(`/lectures/${id}`)
};

// Assignment API
export const assignmentAPI = {
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/assignments/admin/course/${courseId}`),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`)
};

// Tutorial API
export const tutorialAPI = {
  getByCourse: (courseId) => api.get(`/tutorials/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/tutorials/admin/course/${courseId}`),
  getById: (id) => api.get(`/tutorials/${id}`),
  create: (data) => api.post('/tutorials', data),
  update: (id, data) => api.put(`/tutorials/${id}`, data),
  delete: (id) => api.delete(`/tutorials/${id}`)
};

// Prerequisite API
export const prerequisiteAPI = {
  getByCourse: (courseId) => api.get(`/prerequisites/course/${courseId}`),
  create: (data) => api.post('/prerequisites', data),
  update: (id, data) => api.put(`/prerequisites/${id}`, data),
  delete: (id) => api.delete(`/prerequisites/${id}`)
};

// Exam API
export const examAPI = {
  getByCourse: (courseId) => api.get(`/exams/course/${courseId}`),
  getAllByCourse: (courseId) => api.get(`/exams/admin/course/${courseId}`),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`)
};

// Resource API
export const resourceAPI = {
  getByCourse: (courseId, category) => {
    const url = category 
      ? `/resources/course/${courseId}?category=${category}`
      : `/resources/course/${courseId}`;
    return api.get(url);
  },
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`)
};

// Teaching Assistant API
export const taAPI = {
  getByCourse: (courseId) => api.get(`/teaching-assistants/course/${courseId}`),
  getById: (id) => api.get(`/teaching-assistants/${id}`),
  create: (data) => api.post('/teaching-assistants', data),
  update: (id, data) => api.put(`/teaching-assistants/${id}`, data),
  delete: (id) => api.delete(`/teaching-assistants/${id}`)
};

export default api;
