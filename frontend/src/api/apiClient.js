import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

if (import.meta.env.DEV) {
  // Helpful debug in dev tools to confirm which base URL is used
  // eslint-disable-next-line no-console
  console.info('[api] base URL =', baseURL)
}

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
