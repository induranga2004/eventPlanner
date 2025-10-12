// Manual subscription update for testing (since webhooks don't work locally)
require('dotenv').config();
const express = require('express');
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

async function upgradeUserByEmail(email = null) {
  try {
    let user;
    
    if (email) {
      console.log(`Finding user with email: ${email}...`);
      user = await User.findOne({ email });
      if (!user) {
        console.log(`❌ User with email ${email} not found`);
        return;
      }
    } else {
      console.log('Finding latest user...');
      // Find the most recently created user (likely the test user)
      user = await User.findOne().sort({ _id: -1 });
      if (!user) {
        console.log('No users found');
        return;
      }
    }
    
    console.log(`Found user: ${user.email}`);
    console.log(`Current plan: ${user.subscriptionPlan || 'free'}`);
    
    if (user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active') {
      console.log('✅ User is already Pro');
      return;
    }
    
    // Update to Pro
    user.subscriptionPlan = 'pro';
    user.subscriptionStatus = 'active';
    user.proFeatures = {
      unlimitedEvents: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      verifiedBadge: true
    };
    
    await user.save();
    
    console.log(`✅ User ${user.email} upgraded to Pro successfully!`);
    console.log(`Updated plan: ${user.subscriptionPlan}`);
    console.log(`Updated status: ${user.subscriptionStatus}`);
    console.log('🔄 User should now see the Pro Dashboard on next login/refresh');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Allow email parameter from command line
const email = process.argv[2];
console.log('=== Manual Pro Upgrade Tool ===');
if (email) {
  console.log(`Upgrading specific user: ${email}`);
} else {
  console.log('Upgrading latest user...');
}

upgradeUserByEmail(email);