import axios from 'axios'
import { buildPlannerApiUrl } from '../config/api'

// Create axios instance for Python backend (port 1800)
const pythonApi = axios.create({
  baseURL: buildPlannerApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auto-share endpoint (Python backend)
export async function autoShare(payload) {
  const { data } = await pythonApi.post('/auto-share', payload)
  return data
}

// Generate content endpoint (Python backend)
export async function generateContent(topic) {
  const { data } = await pythonApi.post('/generate-content', { topic })
  return data
}

// Share post endpoint (Python backend)
export async function sharePost(imageUrl, caption) {
  const { data } = await pythonApi.post('/share-post', { image_url: imageUrl, caption })
  return data
}

// Analytics endpoint (Python backend)
export async function getAnalytics(postId) {
  const { data } = await pythonApi.post('/analytics', { post_id: postId })
  return data
}

// Verify Mastodon connection (Python backend)
export async function verifyMastodon() {
  const { data } = await pythonApi.get('/mastodon/verify')
  return data
}
