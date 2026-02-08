const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');

// Get all exams for a course (public - only published)
router.get('/course/:courseId', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    const exams = await Exam.find({ 
      courseId: req.params.courseId,
      isPublished: true 
    }).sort({ date: 1 }).populate('coveredLectures', 'title lectureNumber');
    
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all exams for a course (admin - all including drafts)
router.get('/admin/course/:courseId', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ 
      courseId: req.params.courseId
    }).sort({ date: 1 }).populate('coveredLectures', 'title lectureNumber');
    
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single exam
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('coveredLectures');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create exam
router.post('/', auth, async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
  } catch (error) {
    console.error('Error creating exam:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Update exam
router.put('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, message: 'Exam updated successfully', data: exam });
  } catch (error) {
    console.error('Error updating exam:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Delete exam
router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
