import axios from 'axios'
import { getPlannerApiBase, getPlannerHeaders } from '../config/api.js'

const plannerApi = axios.create({
  baseURL: getPlannerApiBase(),
})

plannerApi.interceptors.request.use((config) => {
  config.headers = getPlannerHeaders(config.headers || {});
  return config;
})

export const IntelligenceAPI = {
  analyze: (query, context = 'poster design', language = 'mixed') =>
    plannerApi.post('/api/intelligence/analyze', { query, context, language }).then(r => r.data),
}

export const DesignAPI = {
  start: (payload) => plannerApi.post('/api/design/start', payload).then(r => r.data),
  harmonize: (payload) => plannerApi.post('/api/design/harmonize', payload).then(r => r.data),
  listArtists: (linkOrId) => plannerApi.get('/api/design/artists', { params: { link: linkOrId } }).then(r => r.data),
  uploadImage: (payload) => plannerApi.post('/api/design/upload', payload).then(r => r.data),
  optimizeText: (payload) => plannerApi.post('/api/design/optimize-text-placement', payload).then(r => r.data),
}
