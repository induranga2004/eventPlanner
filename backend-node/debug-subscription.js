require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const connectDB = require('./src/config/database');

const debugSubscription = async () => {
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({}, 'name email plan status stripeCustomerId');
    
    console.log('\n=== ALL USERS IN DATABASE ===');
    users.forEach(user => {
      console.log(`User: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Plan: ${user.plan}`);
      console.log(`  Status: ${user.status}`);
      console.log(`  Stripe Customer: ${user.stripeCustomerId || 'None'}`);
      console.log('---');
    });
    
    // Test token generation for free user
    const freeUser = users.find(u => u.plan === 'free');
    if (freeUser) {
      const token = jwt.sign(
        { id: freeUser._id, email: freeUser.email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log(`\n=== FREE USER TOKEN TEST ===`);
      console.log(`User: ${freeUser.email}`);
      console.log(`Token: ${token}`);
      console.log(`\nTest this token with:`);
      console.log(`Invoke-WebRequest -Uri "http://localhost:4000/api/subscription/status" -Headers @{ "Authorization" = "Bearer ${token}" } | Select-Object -ExpandProperty Content`);
    }
    
    // Test token generation for pro user
    const proUser = users.find(u => u.plan === 'pro');
    if (proUser) {
      const token = jwt.sign(
        { id: proUser._id, email: proUser.email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log(`\n=== PRO USER TOKEN TEST ===`);
      console.log(`User: ${proUser.email}`);
      console.log(`Token: ${token}`);
      console.log(`\nTest this token with:`);
      console.log(`Invoke-WebRequest -Uri "http://localhost:4000/api/subscription/status" -Headers @{ "Authorization" = "Bearer ${token}" } | Select-Object -ExpandProperty Content`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
};

debugSubscription();