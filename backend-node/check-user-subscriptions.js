require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User model (simplified)
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  name: String,
  subscriptionPlan: { type: String, default: 'free' },
  subscriptionStatus: { type: String, default: 'active' },
  proFeatures: {
    unlimitedEvents: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false }
  }
}));

async function checkUserSubscriptions() {
  try {
    console.log('Checking all user subscriptions...\n');
    
    const users = await User.find().sort({ _id: -1 }).limit(5);
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Plan: ${user.subscriptionPlan || 'free'}`);
      console.log(`  Status: ${user.subscriptionStatus || 'active'}`);
      console.log(`  Pro Features: ${user.proFeatures ? 'Yes' : 'No'}`);
      if (user.proFeatures) {
        console.log(`    - Unlimited Events: ${user.proFeatures.unlimitedEvents}`);
        console.log(`    - Advanced Analytics: ${user.proFeatures.advancedAnalytics}`);
      }
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserSubscriptions();