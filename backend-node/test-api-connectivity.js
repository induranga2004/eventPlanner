require('dotenv').config();
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connectivity...');
    
    // Test 1: Check if API is running
    try {
      const response = await axios.get('http://localhost:4000/api/me');
      console.log('❌ This should have failed (no token)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ API is properly rejecting requests without tokens');
      } else {
        console.log('❌ Unexpected API error:', error.message);
      }
    }
    
    // Test 2: Test login endpoint
    console.log('\nTesting login endpoint...');
    try {
      const loginResponse = await axios.post('http://localhost:4000/api/login', {
        email: 'test@example.com',
        password: 'testpassword'
      });
      console.log('Login response:', loginResponse.status);
    } catch (error) {
      console.log('Login failed (expected if no test user):', error.response?.status, error.response?.data);
    }
    
    console.log('\n✅ API connectivity test complete');
    
  } catch (error) {
    console.error('❌ API connectivity test failed:', error.message);
  }
}

testAPI();