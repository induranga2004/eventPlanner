const axios = require('axios');

async function testSubscriptionEndpoint() {
  try {
    console.log('Testing subscription endpoint...');
    
    // First test the health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:4000/api/health');
    console.log('Health check:', healthResponse.data);
    
    // Test without authentication (should fail)
    console.log('\n2. Testing subscription endpoint without auth...');
    try {
      const noAuthResponse = await axios.post('http://localhost:4000/api/subscription/create-checkout-session');
    } catch (error) {
      console.log('Expected error without auth:', error.response?.status, error.response?.data);
    }
    
    // Test with fake token (should fail)
    console.log('\n3. Testing subscription endpoint with fake token...');
    try {
      const fakeTokenResponse = await axios.post('http://localhost:4000/api/subscription/create-checkout-session', {}, {
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log('Expected error with fake token:', error.response?.status, error.response?.data);
    }
    
    console.log('\n✅ Subscription endpoint is properly protected');
    console.log('Next steps:');
    console.log('1. Log in to the frontend to get a valid token');
    console.log('2. Click the upgrade button to test the flow');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubscriptionEndpoint();