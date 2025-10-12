require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Define User model (simplified version)
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  subscriptionPlan: { type: String, default: 'free' },
  subscriptionStatus: { type: String, default: 'active' },
  role: String
}));

async function showTestUsers() {
  try {
    console.log('=== Current Users for Testing ===');
    
    const users = await User.find({}, 'email name subscriptionPlan subscriptionStatus role').sort({ _id: -1 }).limit(5);
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }
    
    users.forEach((user, index) => {
      const isPro = user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active';
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Plan: ${user.subscriptionPlan || 'free'}`);
      console.log(`   Status: ${user.subscriptionStatus || 'active'}`);
      console.log(`   Is Pro: ${isPro ? 'YES' : 'NO'}`);
      console.log(`   Expected Dashboard: ${isPro ? 'PRO DASHBOARD' : 'STANDARD DASHBOARD'}`);
      console.log('   ---');
    });
    
    console.log('\n🔹 Use these credentials to test:');
    console.log('Email: Use one of the emails above');
    console.log('Password: 123456 (standard test password)');
    console.log('\n💡 Tips:');
    console.log('- Users with "Is Pro: YES" should see the Pro Dashboard');
    console.log('- Users with "Is Pro: NO" should see Standard Dashboard with upgrade button');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

showTestUsers();