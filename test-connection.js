const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📍 Connection String:', process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\n✅ SUCCESS! MongoDB Connected');
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('🌍 Host:', mongoose.connection.host);
    console.log('\n✨ Connection is working! You can now run:');
    console.log('   npm run setup    (to create admin user)');
    console.log('   npm run dev      (to start the application)');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ CONNECTION FAILED!');
    console.error('📝 Error:', err.message);
    console.error('\n🔧 SOLUTIONS:');
    console.error('   1. Whitelist your IP in MongoDB Atlas Network Access');
    console.error('   2. Go to: https://cloud.mongodb.com/');
    console.error('   3. Click: Network Access → Add IP Address → Allow Access from Anywhere');
    console.error('   4. Wait 1-2 minutes and try again');
    console.error('\n📖 Detailed guide: See FIX_MONGODB_CONNECTION.md');
    process.exit(1);
  });
