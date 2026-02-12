const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');
const {
  asyncHandler,
  validateObjectId,
  sendSuccess,
  sendList,
  sendNotFound,
  optimizeQuery
} = require('../utils/routeHelpers');

// =====================================================
// @route   POST /api/feedback
// @desc    Submit course feedback (student)
// @access  Private (Student)
// =====================================================
router.post('/', userAuth, asyncHandler(async (req, res) => {
  const { course, courseName, rating, category, message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Feedback must be at least 10 characters'
    });
  }

  const feedback = new Feedback({
    user: req.user._id || req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    course: course || undefined,
    courseName: courseName || undefined,
    rating: rating || undefined,
    category: category || 'General',
    message
  });

  await feedback.save();

  sendSuccess(res, feedback, 'Feedback submitted successfully!', 201);
}));

// =====================================================
// @route   GET /api/feedback
// @desc    Get all feedback (admin only)
// @access  Private (Admin)
// =====================================================
router.get('/', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead, category, sort = '-createdAt' } = req.query;

  const filter = {};
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }
  if (category && category !== 'All') {
    filter.category = category;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [feedbacks, total] = await Promise.all([
    Feedback.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Feedback.countDocuments(filter)
  ]);

  const unreadCount = await Feedback.countDocuments({ isRead: false });

  res.json({
    success: true,
    data: feedbacks,
    total,
    unreadCount,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    message: 'Feedback retrieved successfully'
  });
}));

// =====================================================
// @route   GET /api/feedback/stats
// @desc    Get feedback statistics (admin only)
// @access  Private (Admin)
// =====================================================
router.get('/stats', auth, asyncHandler(async (req, res) => {
  const [total, unread, avgRating, categoryStats] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.countDocuments({ isRead: false }),
    Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]),
    Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  sendSuccess(res, {
    total,
    unread,
    averageRating: avgRating[0]?.avgRating?.toFixed(1) || '0.0',
    categoryBreakdown: categoryStats
  }, 'Feedback stats retrieved');
}));

// =====================================================
// @route   PATCH /api/feedback/:id/read
// @desc    Mark feedback as read (admin)
// @access  Private (Admin)
// =====================================================
router.patch('/:id/read', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!feedback) {
    return sendNotFound(res, 'Feedback');
  }

  sendSuccess(res, feedback, 'Feedback marked as read');
}));

// =====================================================
// @route   PATCH /api/feedback/:id/note
// @desc    Add admin note to feedback
// @access  Private (Admin)
// =====================================================
router.patch('/:id/note', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const { adminNote } = req.body;

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { adminNote, isRead: true },
    { new: true }
  );

  if (!feedback) {
    return sendNotFound(res, 'Feedback');
  }

  sendSuccess(res, feedback, 'Admin note added');
}));

// =====================================================
// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (admin)
// @access  Private (Admin)
// =====================================================
router.delete('/:id', auth, validateObjectId('id'), asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    return sendNotFound(res, 'Feedback');
  }

  sendSuccess(res, null, 'Feedback deleted successfully');
}));

module.exports = router;
