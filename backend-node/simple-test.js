// Simple 2FA test focused on setup
const axios = require('axios');

async function test2FASetup() {
  const baseURL = 'http://localhost:4000/api';
  
  try {
    // Register and login first
    const testEmail = `simple-test-${Date.now()}@example.com`;
    console.log('🔄 Registering user:', testEmail);
    
    try {
      await axios.post(`${baseURL}/auth/register`, {
        email: testEmail,
        password: 'Test123!',
        role: 'user',
        name: 'Simple Test'
      });
      console.log('✅ Registration successful');
    } catch (e) {
      console.log('Registration error:', e.response?.data);
      return;
    }

    console.log('🔄 Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testEmail,
      password: 'Test123!'
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    console.log('Token:', token.substring(0, 50) + '...');

    console.log('🔄 Testing /api/me endpoint first...');
    try {
      const meResponse = await axios.get(`${baseURL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ /api/me works fine');
    } catch (e) {
      console.log('❌ /api/me failed:', e.response?.data);
      return;
    }

    console.log('🔄 Testing 2FA setup...');
    const setupResponse = await axios.post(`${baseURL}/2fa/setup`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ 2FA Setup SUCCESS!');
    console.log('QR Code length:', setupResponse.data.data.qrCode.length);
    console.log('Manual key:', setupResponse.data.data.manualEntryKey);

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('❌ Status:', error.response?.status);
  }
}

test2FASetup();