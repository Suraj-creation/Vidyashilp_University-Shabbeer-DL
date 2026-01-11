const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@dlcourse.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'superadmin'
    });

    await admin.save();
    console.log('✅ Default admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change these credentials after first login!');
    console.log('');
    console.log('🚀 You can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
