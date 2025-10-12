import { useState, useEffect, useContext, createContext } from 'react';

// Create Subscription Context
const SubscriptionContext = createContext();

// Subscription Provider Component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    plan: 'free', // Explicitly set to free by default
    status: 'active',
    expiry: null,
    features: {
      unlimitedEvents: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      verifiedBadge: false
    },
    loading: true,
    error: null
  });

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      setSubscription(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, ensure user is set to free
        setSubscription(prev => ({ 
          ...prev, 
          plan: 'free',
          status: 'active',
          loading: false 
        }));
        return;
      }

      console.log('🔍 Fetching subscription status...');
      const response = await fetch('http://localhost:4000/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Subscription API Response:', data);
        console.log('🔍 Plan from API:', data.plan);
        console.log('🔍 Status from API:', data.status);
        
        setSubscription(prev => ({
          ...prev,
          plan: data.plan || 'free',
          status: data.status || 'active',
          expiry: data.expiry ? new Date(data.expiry) : null,
          features: data.features || prev.features,
          loading: false
        }));
        
        console.log('🔍 Updated subscription state - plan:', data.plan || 'free');
        console.log('🔍 Updated subscription state - status:', data.status || 'active');
        console.log('🔍 Should be Pro?:', (data.plan || 'free') === 'pro' && (data.status || 'active') === 'active');
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        // If API call fails, ensure user is set to free
        setSubscription(prev => ({ 
          ...prev, 
          plan: 'free',
          status: 'active',
          loading: false,
          error: `API Error: ${response.status} ${response.statusText}`
        }));
      }
    } catch (error) {
      console.error('Subscription fetch error:', error);
      
      // Handle different types of errors
      let errorMessage = error.message;
      if (error.message.includes('ERR_INSUFFICIENT_RESOURCES') || 
          error.message.includes('Failed to fetch')) {
        errorMessage = 'Backend server is not running. Please start the server and try again.';
      }
      
      // On error, ensure user is set to free
      setSubscription(prev => ({ 
        ...prev, 
        plan: 'free',
        status: 'active',
        loading: false,
        error: errorMessage
      }));
    }
  };

  // Upgrade to Pro
  const upgradeToPro = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Starting upgrade process...');
      console.log('Token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      console.log('Making request to create checkout session...');
      const response = await fetch('http://localhost:4000/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Checkout session data:', data);
        console.log('Redirecting to:', data.url);
        
        // Create a temporary form to submit to Stripe (more reliable than window.location)
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = data.url;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
        
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        throw new Error(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setSubscription(prev => ({ ...prev, error: error.message }));
      // Show user-friendly error message
      alert(`Upgrade failed: ${error.message}`);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSubscriptionStatus(); // Refresh status
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setSubscription(prev => ({ ...prev, error: error.message }));
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const value = {
    subscription,
    fetchSubscriptionStatus,
    upgradeToPro,
    cancelSubscription,
    isPro: subscription.plan === 'pro' && subscription.status === 'active',
    isLoading: subscription.loading,
    hasFeature: (feature) => subscription.features[feature] || false
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Hook for Pro access checking
export const useProAccess = () => {
  const { subscription, upgradeToPro } = useSubscription();
  
  const hasProAccess = (feature) => {
    if (subscription.plan !== 'pro' || subscription.status !== 'active') {
      return false;
    }
    
    if (subscription.expiry && subscription.expiry < new Date()) {
      return false;
    }
    
    if (feature && !subscription.features[feature]) {
      return false;
    }
    
    return true;
  };
  
  const requireProAccess = (feature, onUpgrade) => {
    if (!hasProAccess(feature)) {
      if (onUpgrade) {
        onUpgrade();
      } else {
        upgradeToPro();
      }
      return false;
    }
    return true;
  };
  
  return {
    hasProAccess,
    requireProAccess,
    isPro: subscription.plan === 'pro' && subscription.status === 'active',
    features: subscription.features
  };
};