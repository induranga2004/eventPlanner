require('dotenv').config();
const User = require('./src/models/User');
const connectDB = require('./src/config/database');

const fixUserSubscriptions = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Fixing user subscription fields...');
    
    // Update all users to have default subscription values if they're undefined
    const result = await User.updateMany(
      {
        $or: [
          { subscriptionPlan: { $exists: false } },
          { subscriptionPlan: null },
          { subscriptionPlan: undefined },
          { subscriptionStatus: { $exists: false } },
          { subscriptionStatus: null },
          { subscriptionStatus: undefined }
        ]
      },
      {
        $set: {
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          proFeatures: {
            unlimitedEvents: false,
            advancedAnalytics: false,
            prioritySupport: false,
            customBranding: false,
            apiAccess: false,
            verifiedBadge: false
          }
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with default subscription values`);
    
    // Keep one user as Pro for testing (111@gmail.com)
    const proUser = await User.findOneAndUpdate(
      { email: '111@gmail.com' },
      {
        $set: {
          subscriptionPlan: 'pro',
          subscriptionStatus: 'active',
          proFeatures: {
            unlimitedEvents: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            verifiedBadge: true
          }
        }
      },
      { new: true }
    );
    
    if (proUser) {
      console.log(`✅ Set ${proUser.email} as Pro user for testing`);
    }
    
    // Show final status
    const users = await User.find({}, 'email subscriptionPlan subscriptionStatus').limit(10);
    console.log('\n=== SAMPLE USERS AFTER FIX ===');
    users.forEach(user => {
      console.log(`${user.email}: plan=${user.subscriptionPlan}, status=${user.subscriptionStatus}`);
    });
    
    console.log('\n✅ All users should now have proper subscription fields!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing user subscriptions:', error);
    process.exit(1);
  }
};

fixUserSubscriptions();