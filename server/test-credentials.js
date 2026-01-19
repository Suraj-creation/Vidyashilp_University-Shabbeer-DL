const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAndFixCredentials() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('');
    
    const Admin = require('./models/Admin');
    
    // Check all admins in database
    const allAdmins = await Admin.find({});
    console.log('📋 All admins in database:');
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role})`);
    });
    console.log('');
    
    // Test credentials from .env
    const testEmail = process.env.ADMIN_EMAIL;
    const testPassword = process.env.ADMIN_PASSWORD;
    
    console.log('🔍 Testing credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');
    
    const admin = await Admin.findOne({ email: testEmail });
    
    if (!admin) {
      console.log('❌ Admin not found with this email');
      console.log('');
      console.log('🔧 Creating new admin with these credentials...');
      
      const newAdmin = new Admin({
        name: 'Dr. Shabbeer Basha',
        email: testEmail,
        password: testPassword,
        role: 'superadmin'
      });
      
      await newAdmin.save();
      console.log('✅ New admin created!');
      
      // Verify the new admin
      const verifyAdmin = await Admin.findOne({ email: testEmail });
      const isValid = await verifyAdmin.comparePassword(testPassword);
      console.log(`🔑 Verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      console.log('✅ Admin found in database');
      
      // Test password
      const isMatch = await admin.comparePassword(testPassword);
      console.log(`🔑 Password test: ${isMatch ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isMatch) {
        console.log('');
        console.log('🔧 Fixing password...');
        admin.password = testPassword;
        await admin.save();
        console.log('✅ Password updated!');
        
        // Verify again
        const verifyAdmin = await Admin.findOne({ email: testEmail });
        const isValid = await verifyAdmin.comparePassword(testPassword);
        console.log(`🔑 Verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
      }
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin credentials are now set to:');
    console.log(`   📧 Email: ${testEmail}`);
    console.log(`   🔑 Password: ${testPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAndFixCredentials();
