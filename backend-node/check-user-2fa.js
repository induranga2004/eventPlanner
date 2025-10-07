const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUserData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'kume@gmail.com' });
    
    if (!user) {
      console.log('❌ User kume@gmail.com not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- 2FA Enabled:', user.twoFactorEnabled);
    console.log('- 2FA Secret exists:', !!user.twoFactorSecret);
    console.log('- 2FA Setup Date:', user.twoFactorSetupDate);
    console.log('- Backup Codes Count:', user.twoFactorBackupCodes ? user.twoFactorBackupCodes.length : 0);
    
    if (user.twoFactorEnabled) {
      console.log('\n✅ User has 2FA enabled - the status endpoint should return this data');
    } else {
      console.log('\n❌ User does NOT have 2FA enabled in database');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserData();