const express = require('express');
const router = express.Router();
const Prerequisite = require('../models/Prerequisite');
const auth = require('../middleware/auth');

// Get all prerequisites for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    const prerequisites = await Prerequisite.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.json({ success: true, count: prerequisites.length, data: prerequisites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create prerequisite
router.post('/', auth, async (req, res) => {
  try {
    const prerequisite = new Prerequisite(req.body);
    await prerequisite.save();
    res.status(201).json({ success: true, message: 'Prerequisite created successfully', data: prerequisite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update prerequisite
router.put('/:id', auth, async (req, res) => {
  try {
    const prerequisite = await Prerequisite.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!prerequisite) {
      return res.status(404).json({ success: false, message: 'Prerequisite not found' });
    }
    res.json({ success: true, message: 'Prerequisite updated successfully', data: prerequisite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete prerequisite
router.delete('/:id', auth, async (req, res) => {
  try {
    const prerequisite = await Prerequisite.findByIdAndDelete(req.params.id);
    if (!prerequisite) {
      return res.status(404).json({ success: false, message: 'Prerequisite not found' });
    }
    res.json({ success: true, message: 'Prerequisite deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
