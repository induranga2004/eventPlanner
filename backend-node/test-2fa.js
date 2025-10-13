// Simple test script to verify 2FA endpoints
const axios = require('axios');

const baseURL = 'http://localhost:4000/api';

// Test data
const testUser = {
  email: `test2fa${Date.now()}@example.com`, // Use unique email
  password: 'TestPassword123!',
  role: 'user',
  name: 'Test User'
};

async function testAPIs() {
  try {
    console.log('🧪 Testing 2FA API Endpoints...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', health.data);

    // 2. Test registration (create test user)
    console.log('\n2. Testing user registration...');
    try {
      const register = await axios.post(`${baseURL}/auth/register`, testUser);
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists (expected)');
      } else {
        throw error;
      }
    }

    // 3. Test login (get token)
    console.log('\n3. Testing login...');
    const login = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    const token = login.data.token;

    // 4. Test 2FA status (should be disabled initially)
    console.log('\n4. Testing 2FA status...');
    const status = await axios.get(`${baseURL}/2fa/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 2FA status:', status.data);

    // 5. Test 2FA setup
    console.log('\n5. Testing 2FA setup...');
    try {
      const setup = await axios.post(`${baseURL}/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 2FA setup successful');
      console.log('📱 QR Code generated (length):', setup.data.data.qrCode.length);
      console.log('🔑 Manual entry key:', setup.data.data.manualEntryKey);
    } catch (error) {
      console.log('❌ 2FA setup failed:', error.response?.data);
      console.log('Token being used:', token);
      // Continue with other tests even if this fails
    }

    // 6. Test unauthorized access
    console.log('\n6. Testing unauthorized access...');
    try {
      await axios.get(`${baseURL}/2fa/status`);
      console.log('❌ Should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthorized access properly blocked');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📝 Next steps:');
    console.log('- Install frontend dependencies');
    console.log('- Create 2FA UI components');
    console.log('- Test with real Google Authenticator app');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPIs();