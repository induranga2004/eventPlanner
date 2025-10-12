const axios = require('axios');
require('dotenv').config();

async function test2FAStatus() {
  console.log('Testing 2FA status endpoint...\n');
  
  try {
    // First test without token (should fail)
    console.log('1. Testing without token (should fail):');
    try {
      await axios.get('http://localhost:4000/api/2fa/status');
      console.log('❌ Should have failed without token');
    } catch (e) {
      if (e.response?.status === 401) {
        console.log('✅ Properly rejected request without token');
      } else {
        console.log('❌ Unexpected response:', e.response?.data);
      }
    }
    
    console.log('\n2. To test with valid token, we need to login first');
    console.log('Please login manually to test the 2FA status endpoint with authentication');
    console.log('Or check browser console for errors when visiting the 2FA settings page');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test2FAStatus();