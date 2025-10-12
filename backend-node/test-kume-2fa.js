const axios = require('axios');
require('dotenv').config();

async function testSpecificUser() {
  console.log('Testing 2FA for kume@gmail.com...\n');
  
  try {
    // First, try to login to get a token (replace password with actual password)
    console.log('1. Attempting login to get authentication token...');
    
    // You'll need to replace 'your_password' with the actual password for kume@gmail.com
    // For security, I'm not including the actual password here
    console.log('Please login manually at http://localhost:5175 with kume@gmail.com');
    console.log('Then check the browser console for debug logs from TwoFactorSettings component');
    console.log('The logs will show if the token is being sent properly and what error occurs');
    
    console.log('\nAlternatively, you can:');
    console.log('1. Open browser dev tools (F12)');
    console.log('2. Go to Network tab');
    console.log('3. Login with kume@gmail.com');
    console.log('4. Navigate to 2FA settings');
    console.log('5. Check if the /api/2fa/status request shows up and what it returns');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpecificUser();