const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  courseName: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  category: {
    type: String,
    enum: ['General', 'Content', 'Instructor', 'Assignments', 'Exams', 'Resources', 'Technical Issue', 'Suggestion'],
    default: 'General'
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [10, 'Feedback must be at least 10 characters'],
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  adminNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ isRead: 1 });
FeedbackSchema.index({ user: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
