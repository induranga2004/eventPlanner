require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User model (simplified)
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  stripeCustomerId: String,
  subscriptionPlan: String,
  subscriptionStatus: String
}));

async function clearInvalidStripeCustomers() {
  try {
    console.log('Clearing invalid Stripe customer IDs...');
    
    // Update all users to remove stripeCustomerId
    // This will force creation of new customers on next upgrade attempt
    const result = await User.updateMany(
      { stripeCustomerId: { $exists: true } },
      { $unset: { stripeCustomerId: 1 } }
    );
    
    console.log(`✅ Cleared ${result.modifiedCount} user records`);
    console.log('Users will get new Stripe customers on next upgrade attempt');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearInvalidStripeCustomers();