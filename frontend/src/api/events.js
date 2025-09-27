import { api } from './apiClient'

// Build path safely regardless of whether baseURL includes '/api' already
function buildPath(path) {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const endsWithApi = typeof base === 'string' && base.trim().toLowerCase().endsWith('/api')
  // if baseURL ends with /api, use plain path without leading slash
  return endsWithApi ? path.replace(/^\//, '') : `/api${path}`
}

export async function saveEvent(payload) {
  const { data } = await api.post(buildPath('/events'), payload)
  return data
}

export async function autoShare(payload) {
  const { data } = await api.post(buildPath('/auto-share'), payload)
  return data
}
