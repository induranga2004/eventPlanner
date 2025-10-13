require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const connectDB = require('./src/config/database');

const testProUser = async () => {
  try {
    await connectDB();
    
    // Find the Pro user
    const proUser = await User.findOne({ email: '111@gmail.com' });
    if (!proUser) {
      console.log('❌ Pro user not found');
      process.exit(1);
    }
    
    console.log(`🔍 Pro User: ${proUser.email}`);
    console.log(`Plan: ${proUser.subscriptionPlan}`);
    console.log(`Status: ${proUser.subscriptionStatus}`);
    
    // Generate token for Pro user
    const token = jwt.sign(
      { id: proUser._id, email: proUser.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log(`\n=== PRO USER TOKEN ===`);
    console.log(`Token: ${token}`);
    console.log(`\nTest this token with:`);
    console.log(`Invoke-WebRequest -Uri "http://localhost:4000/api/subscription/status" -Headers @{ "Authorization" = "Bearer ${token}" } | Select-Object -ExpandProperty Content`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testProUser();