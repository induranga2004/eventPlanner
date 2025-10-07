import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { me } from '../api/auth';

export const useUserData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // First, try to get user data from localStorage (set during login/2FA)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Using stored user data:', userData);
            setUser(userData);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            localStorage.removeItem('user'); // Remove corrupted data
          }
        }

        // Fallback to API call if no stored user data
        console.log('Fetching user data from API...');
        const data = await me();
        console.log('API user data:', data.user);
        setUser(data.user);
        
        // Store the fetched data for future use
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        // Clear any invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return { user, loading, handleLogout };
};