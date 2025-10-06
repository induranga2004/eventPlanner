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
    // Dev fallback: return mock user data so dashboards render without a DB
    if (import.meta.env.DEV) {
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

