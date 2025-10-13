// Test the checkout session creation API
require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testCheckoutAPI() {
  try {
    // Get a real user token
    const token = jwt.sign(
      { id: '68ebfde65e83367b92d27241', email: '123@gmail.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('=== Testing Checkout Session Creation ===');
    console.log('Token:', token);
    
    const response = await fetch('http://localhost:4000/api/subscription/create-checkout-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Checkout session data:', data);
      console.log('Session URL:', data.url);
      
      // Test if the URL is accessible
      console.log('\n=== Testing URL Accessibility ===');
      const urlTest = await fetch(data.url, { method: 'HEAD' });
      console.log('URL test status:', urlTest.status);
      console.log('URL is accessible:', urlTest.ok);
    } else {
      const error = await response.json();
      console.error('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testCheckoutAPI();