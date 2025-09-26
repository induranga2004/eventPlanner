import { api } from '../api/apiClient'

export const IntelligenceAPI = {
  analyze: (query, context = 'poster design', language = 'mixed') =>
    api.post('/api/intelligence/analyze', { query, context, language }).then(r => r.data),
}

export const DesignAPI = {
  start: (payload) => api.post('/api/design/start', payload).then(r => r.data),
  harmonize: (payload) => api.post('/api/design/harmonize', payload).then(r => r.data),
}
