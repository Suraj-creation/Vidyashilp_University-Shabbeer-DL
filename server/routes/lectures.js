const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');
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
// @route   GET /api/lectures/course/:courseId
// @desc    Get all published lectures for a course (Public)
// @access  Public
// =====================================================
router.get('/course/:courseId', cacheControl(300), validateObjectId('courseId'), asyncHandler(async (req, res) => {
  const query = Lecture.find({ 
    courseId: req.params.courseId,
    isPublished: true 
  });
  
  const lectures = await optimizeQuery(query, {
    sort: { lectureNumber: 1 },
    timeout: 8000
  });
  
  sendList(res, lectures, 'Lectures retrieved successfully');
}));

// =====================================================
// @route   GET /api/lectures/admin/course/:courseId
// @desc    Get all lectures for a course (Admin - including drafts)
// @access  Private
// =====================================================
router.get('/admin/course/:courseId', auth, validateObjectId('courseId'), asyncHandler(async (req, res) => {
  const query = Lecture.find({ courseId: req.params.courseId });
  
  const lectures = await optimizeQuery(query, {
    sort: { lectureNumber: 1 },
    timeout: 8000
  });
  
  sendList(res, lectures, 'Lectures retrieved successfully');
}));

// =====================================================
// @route   GET /api/lectures/:id
// @desc    Get single lecture by ID
// @access  Public
// =====================================================
router.get('/:id', validateObjectId('id'), asyncHandler(async (req, res) => {
  const query = Lecture.findById(req.params.id);
  const lecture = await optimizeQuery(query, { timeout: 5000 });
  
  if (!lecture) {
    return sendNotFound(res, 'Lecture');
  }
  
  sendSuccess(res, lecture, 'Lecture retrieved successfully');
}));

// =====================================================
// @route   POST /api/lectures
// @desc    Create new lecture
// @access  Private (Admin)
// =====================================================
router.post('/', auth, asyncHandler(async (req, res) => {
  const lecture = new Lecture(req.body);
  await lecture.save();
  
  sendSuccess(res, lecture, 'Lecture created successfully', 201);
}));

// =====================================================
// @route   PUT /api/lectures/:id
// @desc    Update lecture
// @access  Private (Admin)
// =====================================================
router.put('/:id', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const lecture = await Lecture.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true, runValidators: true }
  ).maxTimeMS(8000);
  
  if (!lecture) {
    return sendNotFound(res, 'Lecture');
  }
  
  sendSuccess(res, lecture, 'Lecture updated successfully');
}));

// =====================================================
// @route   DELETE /api/lectures/:id
// @desc    Delete lecture
// @access  Private (Admin)
// =====================================================
router.delete('/:id', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const lecture = await Lecture.findByIdAndDelete(req.params.id).maxTimeMS(8000);
  
  if (!lecture) {
    return sendNotFound(res, 'Lecture');
  }
  
  sendSuccess(res, null, 'Lecture deleted successfully');
}));

// Error handling middleware for this router
router.use((error, req, res, next) => {
  handleRouteError(error, res, 'Lecture operation');
});

module.exports = router;
