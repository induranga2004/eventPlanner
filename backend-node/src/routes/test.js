const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Test endpoint to manually upgrade user to Pro (for local testing)
router.post('/test-upgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Upgrade user to Pro
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
    
    console.log(`Manual upgrade: User ${user.email} upgraded to Pro`);
    
    res.json({ 
      message: 'User upgraded to Pro successfully',
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      features: user.proFeatures
    });
  } catch (error) {
    console.error('Manual upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade user' });
  }
});

module.exports = router;