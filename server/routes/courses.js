const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { 
  asyncHandler, 
  validateObjectId, 
  sendSuccess, 
  sendList, 
  sendNotFound, 
  handleRouteError,
  optimizeQuery,
  cacheControl
} = require('../utils/routeHelpers');

// =====================================================
// @route   GET /api/courses
// @desc    Get all active courses
// @access  Public
// =====================================================
router.get('/', cacheControl(300), asyncHandler(async (req, res) => {
  const query = Course.find({ isActive: true });
  const courses = await optimizeQuery(query, {
    sort: { createdAt: -1 },
    timeout: 8000
  });
  
  sendList(res, courses, 'Courses retrieved successfully');
}));

// =====================================================
// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
// =====================================================
router.get('/:id', validateObjectId('id'), asyncHandler(async (req, res) => {
  const query = Course.findById(req.params.id);
  const course = await optimizeQuery(query, { timeout: 5000 });
  
  if (!course) {
    return sendNotFound(res, 'Course');
  }

  sendSuccess(res, course, 'Course retrieved successfully');
}));

// =====================================================
// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin)
// =====================================================
router.post('/', auth, asyncHandler(async (req, res) => {
  const course = new Course(req.body);
  await course.save();

  sendSuccess(res, course, 'Course created successfully', 201);
}));

// =====================================================
// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin)
// =====================================================
router.put('/:id', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).maxTimeMS(8000);

  if (!course) {
    return sendNotFound(res, 'Course');
  }

  sendSuccess(res, course, 'Course updated successfully');
}));

// =====================================================
// @route   DELETE /api/courses/:id
// @desc    Delete course (soft delete)
// @access  Private (Admin)
// =====================================================
router.delete('/:id', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).maxTimeMS(8000);

  if (!course) {
    return sendNotFound(res, 'Course');
  }

  sendSuccess(res, null, 'Course deleted successfully');
}));

// Error handling middleware for this router
router.use((error, req, res, next) => {
  handleRouteError(error, res, 'Course operation');
});

module.exports = router;
