const User = require('../models/User');

// Middleware to check if user has Pro access
const checkProAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user has Pro subscription
      if (user.subscriptionPlan !== 'pro') {
        return res.status(403).json({
          error: 'Pro subscription required',
          upgradeUrl: '/upgrade',
          feature: feature,
          currentPlan: user.subscriptionPlan
        });
      }
      
      // Check if subscription is active
      if (user.subscriptionStatus !== 'active') {
        return res.status(403).json({
          error: 'Pro subscription not active',
          status: user.subscriptionStatus,
          renewUrl: '/renew'
        });
      }
      
      // Check if subscription hasn't expired
      if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
        return res.status(403).json({
          error: 'Pro subscription expired',
          expiry: user.subscriptionExpiry,
          renewUrl: '/renew'
        });
      }
      
      // Check if user has access to specific feature
      if (feature && !user.proFeatures[feature]) {
        return res.status(403).json({
          error: `Feature '${feature}' not available in your plan`,
          availableFeatures: Object.keys(user.proFeatures).filter(f => user.proFeatures[f])
        });
      }
      
      next();
    } catch (error) {
      console.error('Pro access check error:', error);
      res.status(500).json({ error: 'Failed to verify Pro access' });
    }
  };
};

// Middleware to add subscription info to request
const addSubscriptionInfo = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id).select('subscriptionPlan subscriptionStatus subscriptionExpiry proFeatures');
      req.subscription = {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus,
        expiry: user.subscriptionExpiry,
        features: user.proFeatures,
        isPro: user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active'
      };
    }
    next();
  } catch (error) {
    console.error('Add subscription info error:', error);
    next(); // Continue without subscription info
  }
};

// Check feature usage limits
const checkUsageLimit = (resource, limit) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Pro users have unlimited access
      if (user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active') {
        return next();
      }
      
      // Check usage for free users
      // This would require implementing usage tracking
      // For now, we'll implement basic limits
      
      const usageLimits = {
        events: 5,
        photos: 2,
        teamMembers: 1
      };
      
      // You would implement actual usage counting here
      // const currentUsage = await getCurrentUsage(user._id, resource);
      
      // For demonstration, we'll assume usage is within limits
      next();
      
    } catch (error) {
      console.error('Usage limit check error:', error);
      res.status(500).json({ error: 'Failed to check usage limits' });
    }
  };
};

module.exports = {
  checkProAccess,
  addSubscriptionInfo,
  checkUsageLimit
};