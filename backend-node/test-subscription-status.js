const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventplanner')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testSubscriptionStatus() {
  try {
    console.log('=== Testing Subscription Status ===');
    
    // Get all users and their subscription status
    const users = await User.find({}, 'name email subscriptionPlan subscriptionStatus subscriptionExpiry proFeatures');
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Plan: ${user.subscriptionPlan || 'free'}`);
      console.log(`   Status: ${user.subscriptionStatus || 'active'}`);
      console.log(`   Expiry: ${user.subscriptionExpiry || 'N/A'}`);
      console.log(`   Pro Features: ${JSON.stringify(user.proFeatures || {})}`);
      console.log('');
    });
    
    // Test what the API would return for each user
    console.log('=== API Response Preview ===');
    users.forEach((user, index) => {
      const isPro = user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active';
      console.log(`${index + 1}. ${user.name}:`);
      console.log(`   API Response: {`);
      console.log(`     plan: "${user.subscriptionPlan || 'free'}",`);
      console.log(`     status: "${user.subscriptionStatus || 'active'}",`);
      console.log(`     expiry: ${user.subscriptionExpiry ? `"${user.subscriptionExpiry}"` : 'null'},`);
      console.log(`     features: ${JSON.stringify(user.proFeatures || {})}`);
      console.log(`   }`);
      console.log(`   Should show upgrade button: ${!isPro}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSubscriptionStatus();