require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

// Test user token generation for API testing
const testUserEmail = '123@gmail.com';
const testUserId = '507f1f77bcf86cd799439011'; // Mock ObjectId

const token = jwt.sign(
  { id: testUserId, email: testUserEmail, role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('=== Test API Call ===');
console.log(`Test user: ${testUserEmail}`);
console.log(`Test token: ${token}`);
console.log('\nTest the subscription API with curl:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:4000/api/subscription/status`);

// Also test with a real user from database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  name: String,
  subscriptionPlan: { type: String, default: 'free' },
  subscriptionStatus: { type: String, default: 'active' }
}));

async function testWithRealUser() {
  try {
    const user = await User.findOne({ email: testUserEmail });
    if (user) {
      const realToken = jwt.sign(
        { id: user._id, email: user.email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log('\n=== Real User Test ===');
      console.log(`Real user ID: ${user._id}`);
      console.log(`Real user plan: ${user.subscriptionPlan || 'free'}`);
      console.log(`Real token: ${realToken}`);
      console.log('\nTest with real user:');
      console.log(`curl -H "Authorization: Bearer ${realToken}" http://localhost:4000/api/subscription/status`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testWithRealUser();