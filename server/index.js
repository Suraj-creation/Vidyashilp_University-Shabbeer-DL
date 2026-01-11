const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('💡 Check if:');
  console.error('   1. Your IP is whitelisted in MongoDB Atlas');
  console.error('   2. The cluster is running (not paused)');
  console.error('   3. Connection string is correct in .env file');
});

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const assignmentRoutes = require('./routes/assignments');
const taRoutes = require('./routes/teachingAssistants');
const tutorialRoutes = require('./routes/tutorials');
const prerequisiteRoutes = require('./routes/prerequisites');
const examRoutes = require('./routes/exams');
const resourceRoutes = require('./routes/resources');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teaching-assistants', taRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/prerequisites', prerequisiteRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/resources', resourceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
