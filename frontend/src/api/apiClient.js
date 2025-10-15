import axios from 'axios'
import { getNodeApiBase } from '../config/api.js'

const baseURL = getNodeApiBase()

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
