import { api } from './apiClient'

export async function register(formData) {
  const { data } = await api.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function me() {
  try {
    const { data } = await api.get('/me')
    return data
  } catch (err) {
    console.error('Failed to fetch user data from /me endpoint:', err);
    
    // In dev mode, check if there's stored user data from login before using fallback
    if (import.meta.env.DEV) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return { user: userData };
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
        }
      }
      
      // Only use fallback if no stored user data is available
      console.warn('Using dev fallback user data - this should not happen in production');
      return {
        user: {
          _id: 'dev-user-1',
          name: 'Alex Rivera',
          email: 'alex@example.com',
          phone: '+1 (555) 123-4567',
          role: 'musician',
          createdAt: new Date().toISOString(),
          spotifyLink: 'https://open.spotify.com/artist/example',
          photo: '/uploads/sample1.png',
          additionalPhoto: '/uploads/sample2.png',
          photoBgRemoved: '/uploads/sample1.png',
          additionalPhotoBgRemoved: '/uploads/sample2.png',
          capacity: null,
        }
      }
    }
    throw err
  }
}

export async function reprocessAdditionalPhoto() {
  // Background removal disabled on server; return fresh user data instead
  const { data } = await api.get('/me');
  return { user: data.user, message: 'Background removal feature disabled' };
}

export async function reprocessAllPhotos() {
  // Background removal disabled on server; return fresh user data instead
  const { data } = await api.get('/me');
  return { user: data.user, message: 'Background removal feature disabled' };
}

// Two-Factor Authentication API methods
export async function setup2FA() {
  const { data } = await api.post('/2fa/setup');
  return data;
}

export async function enable2FA(token) {
  const { data } = await api.post('/2fa/enable', { token });
  return data;
}

export async function verify2FA({ email, token, isBackupCode = false }) {
  const { data } = await api.post('/2fa/verify', { email, token, isBackupCode });
  return data;
}

export async function disable2FA({ token, password }) {
  const { data } = await api.post('/2fa/disable', { token, password });
  return data;
}

export async function get2FAStatus() {
  const { data } = await api.get('/2fa/status');
  return data;
}

export async function generateNewBackupCodes(token) {
  const { data } = await api.post('/2fa/backup-codes', { token });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

