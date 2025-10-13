const axios = require('axios');

async function testProfileUpdate() {
  try {
    // First, let's test with a mock JWT token
    // In a real scenario, you would login first to get a valid token
    console.log('Testing Profile Update API...');
    
    // Mock data for testing
    const updateData = {
      phone: '123-456-7890',
      bio: 'Updated bio for testing',
      website: 'https://example.com',
      experience: 5
    };

    // This will fail with 401 since we don't have a valid token
    // But it will show that the endpoint exists and responds
    const response = await axios.put('http://localhost:4000/api/auth/update-profile', updateData, {
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Expected error (since we used a fake token):');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('✅ API endpoint exists and properly validates tokens');
      }
    } else {
      console.error('Network error:', error.message);
    }
  }
}

testProfileUpdate();