const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial');
const auth = require('../middleware/auth');

// Get all tutorials for a course (public - only published)
router.get('/course/:courseId', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    const tutorials = await Tutorial.find({ 
      courseId: req.params.courseId,
      isPublished: true 
    }).sort({ tutorialNumber: 1 }).populate('coveredInLectures', 'title lectureNumber');
    
    res.json({ success: true, count: tutorials.length, data: tutorials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all tutorials for a course (admin - all including drafts)
router.get('/admin/course/:courseId', auth, async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ 
      courseId: req.params.courseId
    }).sort({ tutorialNumber: 1 }).populate('coveredInLectures', 'title lectureNumber');
    
    res.json({ success: true, count: tutorials.length, data: tutorials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single tutorial
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id).populate('coveredInLectures');
    if (!tutorial) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }
    res.json({ success: true, data: tutorial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create tutorial
router.post('/', auth, async (req, res) => {
  try {
    const tutorial = new Tutorial(req.body);
    await tutorial.save();
    res.status(201).json({ success: true, message: 'Tutorial created successfully', data: tutorial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update tutorial
router.put('/:id', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tutorial) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }
    res.json({ success: true, message: 'Tutorial updated successfully', data: tutorial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete tutorial
router.delete('/:id', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }
    res.json({ success: true, message: 'Tutorial deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
