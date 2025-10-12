require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  try {
    console.log('Testing Stripe connection with your keys...');
    console.log('Using key:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NOT_FOUND');
    
    // Test 1: Try to list customers (this should work with valid keys)
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('✅ Stripe connection successful!');
    console.log('Customers test passed:', customers.data.length >= 0);
    
    // Test 2: Try to create a test checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'EventPlanner Pro Subscription',
              description: 'Test checkout session',
            },
            unit_amount: 999,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5174/payment/success',
      cancel_url: 'http://localhost:5174/payment/cancel',
    });
    
    console.log('✅ Checkout session creation successful!');
    console.log('Session URL:', session.url);
    console.log('✅ Your Stripe keys are working perfectly!');
    
    return true;
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    console.error('Error type:', error.type);
    return false;
  }
}

testStripeConnection();