const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

// Get all resources for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    const { category } = req.query;
    const query = { courseId: req.params.courseId, isActive: true };
    if (category) query.category = category;
    
    const resources = await Resource.find(query).sort({ category: 1, order: 1 });
    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get resources by category
router.get('/course/:courseId/category/:category', async (req, res) => {
  try {
    const resources = await Resource.find({ 
      courseId: req.params.courseId,
      category: req.params.category,
      isActive: true 
    }).sort({ order: 1 });
    
    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create resource
router.post('/', auth, async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json({ success: true, message: 'Resource created successfully', data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update resource
router.put('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource updated successfully', data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
