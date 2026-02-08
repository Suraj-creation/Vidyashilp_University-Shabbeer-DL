const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// Get all assignments for a course (public - only published)
router.get('/course/:courseId', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    const assignments = await Assignment.find({ 
      courseId: req.params.courseId,
      isPublished: true 
    }).sort({ assignmentNumber: 1 }).populate('relatedLectures', 'title lectureNumber');
    
    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all assignments for a course (admin - all including drafts)
router.get('/admin/course/:courseId', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      courseId: req.params.courseId
    }).sort({ assignmentNumber: 1 }).populate('relatedLectures', 'title lectureNumber');
    
    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('relatedLectures');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create assignment
router.post('/', auth, async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json({ success: true, message: 'Assignment created successfully', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update assignment
router.put('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment updated successfully', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete assignment
router.delete('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
