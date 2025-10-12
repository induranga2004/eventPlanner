require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

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

async function resetAllUsersToFree() {
  try {
    console.log('Resetting all users to FREE plan for testing...\n');
    
    const result = await User.updateMany(
      {},
      {
        $set: {
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          'proFeatures.unlimitedEvents': false,
          'proFeatures.advancedAnalytics': false,
          'proFeatures.prioritySupport': false,
          'proFeatures.customBranding': false,
          'proFeatures.apiAccess': false,
          'proFeatures.verifiedBadge': false
        }
      }
    );
    
    console.log(`✅ Reset ${result.modifiedCount} users to FREE plan`);
    console.log('All users should now see the "Upgrade to Pro" button');
    
    // Show updated users
    const users = await User.find().limit(3);
    console.log('\nUpdated users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Plan: ${user.subscriptionPlan}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAllUsersToFree();