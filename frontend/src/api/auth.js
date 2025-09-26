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
  const { data } = await api.get('/me')
  return data
}

