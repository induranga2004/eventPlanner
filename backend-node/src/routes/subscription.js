const express = require('express');
const { URL } = require('url');
const router = express.Router();
const User = require('../models/User');
const StripeEventLog = require('../models/StripeEventLog');
const auth = require('../middleware/auth');

const SERVICE_TOKEN_HEADER = 'x-service-token';
const manualUpgradeToken = process.env.MANUAL_UPGRADE_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

const ensureStripeSecret = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ConfigError('Stripe secret key is not configured. Set STRIPE_SECRET_KEY in the environment.');
  }
};

const buildCheckoutUrls = () => {
  const baseUrl = process.env.FRONTEND_URL;
  if (!baseUrl) {
    throw new ConfigError('Frontend URL is not configured. Set FRONTEND_URL in the environment.');
  }

  let successUrlString;
  let cancelUrlString;
  try {
    const successUrl = new URL('/payment/success', baseUrl);
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    successUrlString = successUrl.toString();

    const cancelUrl = new URL('/payment/cancel', baseUrl);
    cancelUrlString = cancelUrl.toString();
  } catch (error) {
    throw new ConfigError('FRONTEND_URL must be a valid absolute URL.');
  }

  return { successUrl: successUrlString, cancelUrl: cancelUrlString };
};

const logDebug = (...args) => {
  if (!isProduction) {
    console.log(...args);
  }
};

const logError = (message, error, context = {}) => {
  const details = { ...context };
  if (error) {
    details.error = error.message;
    if (error.code) {
      details.code = error.code;
    }
  }
  console.error(`[Stripe] ${message}`, Object.keys(details).length ? details : '');
};

const hasProcessedEvent = async (eventId) => {
  if (!eventId) {
    return false;
  }
  return StripeEventLog.exists({ eventId });
};

const markEventProcessed = async (eventId, type, metadata = {}) => {
  if (!eventId) {
    return;
  }

  try {
    await StripeEventLog.create({ eventId, type, metadata });
  } catch (error) {
    if (error.code !== 11000) {
      logError('Failed to mark Stripe event as processed', error, { eventId, type });
    }
  }
};

const ensurePaymentHistory = (user) => {
  if (!Array.isArray(user.paymentHistory)) {
    user.paymentHistory = [];
  }
};

// Initialize Stripe lazily to ensure env vars are loaded
let stripe;
const getStripe = () => {
  if (!stripe) {
    ensureStripeSecret();
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Create Stripe checkout session for Pro subscription
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { successUrl, cancelUrl } = buildCheckoutUrls();
    const stripe = getStripe();

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user already has Pro, return error
    if (user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active') {
      return res.status(400).json({ error: 'User already has active Pro subscription' });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } catch (error) {
        // If customer doesn't exist in Stripe, create a new one
        if (error.code === 'resource_missing') {
          logDebug('Stripe customer missing, creating new customer', user.stripeCustomerId);
          customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
              userId: user._id.toString(),
              role: user.role
            }
          });
          
          // Update user with new customer ID
          user.stripeCustomerId = customer.id;
          await user.save();
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
          role: user.role
        }
      });
      
      // Save customer ID to user
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create checkout session
    logDebug('Creating Stripe checkout session for user', user._id.toString());
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'EventPlanner Pro Subscription',
              description: 'Unlock premium features including unlimited events, advanced analytics, and priority support',
            },
            unit_amount: 999, // $9.99 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
        plan: 'pro'
      }
    });

    logDebug('Checkout session created successfully', session.id);
    
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    if (error instanceof ConfigError) {
      return res.status(500).json({ error: error.message });
    }

    console.error('Checkout session creation error:', error.message, error.code ? `(code: ${error.code})` : '');
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscriptionPlan subscriptionStatus subscriptionExpiry proFeatures');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      expiry: user.subscriptionExpiry,
      features: user.proFeatures
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const user = await User.findById(req.user.id);
    
    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update user status
    user.subscriptionStatus = 'cancelled';
    await user.save();

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logError('Stripe webhook secret not configured. Set STRIPE_WEBHOOK_SECRET to process webhooks securely.');
    return res.status(500).json({ error: 'Stripe webhook secret is not configured' });
  }

  if (!sig) {
    return res.status(400).json({ error: 'Missing Stripe signature header' });
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logError('Webhook signature verification failed', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const { id: eventId, type: eventType } = event;

  try {
    if (await hasProcessedEvent(eventId)) {
      logDebug('Skipping already processed Stripe event', eventId, eventType);
      return res.json({ received: true, duplicate: true });
    }

    const handler = getStripeEventHandler(eventType);

    if (!handler) {
      logDebug('Unhandled Stripe event type', eventType);
      await markEventProcessed(eventId, eventType, { ignored: true });
      return res.json({ received: true, ignored: true });
    }

    await handler(event.data.object, event);
    await markEventProcessed(eventId, eventType);

    return res.json({ received: true });
  } catch (error) {
    logError('Stripe webhook processing failed', error, { eventId, eventType });
    return res.status(500).json({ error: 'Failed to process Stripe webhook event' });
  }
});

const stripeEventHandlers = {
  'checkout.session.completed': handleCheckoutCompleted,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_succeeded': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed,
};

function getStripeEventHandler(eventType) {
  return stripeEventHandlers[eventType];
}

// Helper functions for webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session?.metadata?.userId;

  if (!userId) {
    logError('Checkout session missing user metadata', null, { sessionId: session?.id });
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    logError('User not found for checkout session', null, { userId, sessionId: session?.id });
    return;
  }

  try {
    user.subscriptionPlan = 'pro';
    user.subscriptionStatus = 'active';
    user.proFeatures = {
      unlimitedEvents: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      verifiedBadge: true,
    };

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    user.stripeSubscriptionId = subscription.id;
    user.subscriptionExpiry = new Date(subscription.current_period_end * 1000);

    await user.save();
    logDebug('User upgraded to Pro via checkout session', user._id.toString());
  } catch (error) {
    logError('Error handling checkout completed', error, { userId, sessionId: session?.id });
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });

    if (!user) {
      logError('Subscription update received for unknown customer', null, { customerId: subscription.customer });
      return;
    }

    user.subscriptionStatus = subscription.status;
    user.subscriptionExpiry = new Date(subscription.current_period_end * 1000);
    await user.save();
  } catch (error) {
    logError('Error handling subscription updated', error, { customerId: subscription.customer });
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });

    if (!user) {
      logError('Subscription deletion received for unknown customer', null, { customerId: subscription.customer });
      return;
    }

    user.subscriptionPlan = 'free';
    user.subscriptionStatus = 'expired';
    user.proFeatures = {
      unlimitedEvents: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      verifiedBadge: false,
    };
    await user.save();
  } catch (error) {
    logError('Error handling subscription deleted', error, { customerId: subscription.customer });
    throw error;
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });

    if (!user) {
      logError('Payment succeeded for unknown customer', null, { customerId: invoice.customer, invoiceId: invoice.id });
      return;
    }

    ensurePaymentHistory(user);

    user.paymentHistory.push({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      date: new Date(invoice.created * 1000),
      status: 'succeeded',
      invoiceId: invoice.id,
    });
    await user.save();
  } catch (error) {
    logError('Error handling payment succeeded', error, { customerId: invoice.customer, invoiceId: invoice.id });
    throw error;
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });

    if (!user) {
      logError('Payment failed for unknown customer', null, { customerId: invoice.customer, invoiceId: invoice.id });
      return;
    }

    ensurePaymentHistory(user);

    user.paymentHistory.push({
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      date: new Date(invoice.created * 1000),
      status: 'failed',
      invoiceId: invoice.id,
    });
    await user.save();
  } catch (error) {
    logError('Error handling payment failed', error, { customerId: invoice.customer, invoiceId: invoice.id });
    throw error;
  }
}

// Manual upgrade endpoint for development (simulates successful payment)
router.post('/manual-upgrade', auth, async (req, res) => {
  try {
    const providedToken = req.headers[SERVICE_TOKEN_HEADER];

    if (manualUpgradeToken) {
      if (providedToken !== manualUpgradeToken) {
        return res.status(403).json({ error: 'Invalid service token for manual upgrade' });
      }
    } else if (isProduction) {
      return res.status(403).json({ error: 'Manual upgrade is disabled in production without MANUAL_UPGRADE_TOKEN' });
    }

    logDebug('Manual upgrade triggered for user', req.user?.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscriptionPlan === 'pro' && user.subscriptionStatus === 'active') {
      return res.json({ message: 'User is already Pro', alreadyPro: true });
    }

    // Simulate successful payment and upgrade user to Pro
    user.subscriptionPlan = 'pro';
    user.subscriptionStatus = 'active';
    user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    user.proFeatures = {
      unlimitedEvents: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      verifiedBadge: true
    };

    await user.save();
    
  logDebug('User manually upgraded to Pro', user.email);
    
    res.json({ 
      message: 'Successfully upgraded to Pro', 
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      features: user.proFeatures
    });
  } catch (error) {
    console.error('Manual upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade manually' });
  }
});

module.exports = router;