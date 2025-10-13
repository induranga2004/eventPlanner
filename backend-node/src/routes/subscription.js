const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Initialize Stripe lazily to ensure env vars are loaded
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Create Stripe checkout session for Pro subscription
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const stripe = getStripe();
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
          console.log(`Customer ${user.stripeCustomerId} not found in Stripe, creating new customer`);
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
    console.log('Creating Stripe checkout session...');
    console.log('Frontend URL:', process.env.FRONTEND_URL);
    console.log('Success URL will be:', `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`);
    console.log('Cancel URL will be:', `${process.env.FRONTEND_URL}/payment/cancel`);
    
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
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: user._id.toString(),
        plan: 'pro'
      }
    });

    console.log('Checkout session created successfully:');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);
    
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout session creation error:', error);
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

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper functions for webhook handlers
async function handleCheckoutCompleted(session) {
  try {
    const userId = session.metadata.userId;
    const user = await User.findById(userId);
    
    if (user) {
      // Update user to Pro
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
      
      // Get subscription details
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      user.stripeSubscriptionId = subscription.id;
      user.subscriptionExpiry = new Date(subscription.current_period_end * 1000);
      
      await user.save();
      console.log(`User ${userId} upgraded to Pro`);
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (user) {
      user.subscriptionStatus = subscription.status;
      user.subscriptionExpiry = new Date(subscription.current_period_end * 1000);
      await user.save();
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (user) {
      user.subscriptionPlan = 'free';
      user.subscriptionStatus = 'expired';
      user.proFeatures = {
        unlimitedEvents: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
        verifiedBadge: false
      };
      await user.save();
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    
    if (user) {
      // Add to payment history
      user.paymentHistory.push({
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency,
        date: new Date(invoice.created * 1000),
        status: 'succeeded',
        invoiceId: invoice.id
      });
      await user.save();
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    
    if (user) {
      // Add to payment history
      user.paymentHistory.push({
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        date: new Date(invoice.created * 1000),
        status: 'failed',
        invoiceId: invoice.id
      });
      await user.save();
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Manual upgrade endpoint for development (simulates successful payment)
router.post('/manual-upgrade', auth, async (req, res) => {
  try {
    console.log('Manual upgrade triggered for user:', req.user.id);
    
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
    
    console.log(`✅ User ${user.email} manually upgraded to Pro`);
    
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