import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, TextField, Grid, Button, Stack,
  Alert, Snackbar, CircularProgress, Divider, InputAdornment
} from '@mui/material'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import ImageIcon from '@mui/icons-material/Image'
import SaveIcon from '@mui/icons-material/Save'
import { autoShare } from '../api/socialShare'
import { getLatestEvent } from '../api/events'

export default function AutoShare() {
  const location = useLocation()
  const [form, setForm] = useState({
    name: '',
    date: '',
    venue: '',
    price: '',
    audience: '',
    photoUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [loadedFromWizard, setLoadedFromWizard] = useState(false)

  const preview = useMemo(() => form.photoUrl?.trim() || '', [form.photoUrl])

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  // Prefill the form with data from AIPosterWizard (via navigation state) or latest event from MongoDB
  // This runs only once on mount and won't override any user edits afterward.
  useEffect(() => {
    (async () => {
      try {
        // First priority: Check if data was passed from AIPosterWizard
        const passedData = location.state
        if (passedData && passedData.photoUrl) {
          setForm({
            name: passedData.eventName || '',
            date: passedData.date || '',
            venue: passedData.venue || '',
            price: passedData.price || '',
            audience: passedData.audience || '',
            photoUrl: passedData.photoUrl || ''
          })
          setLoadedFromWizard(true)
          setToast('Loaded poster from AI wizard! 🎨')
          return // Don't fetch from MongoDB if we have passed data
        }

        // Second priority: Fetch latest event from MongoDB
        const latest = await getLatestEvent()
        if (latest) {
          setForm((s) => {
            // Only fill fields that are currently empty to avoid clobbering preset values
            const next = { ...s }
            const fields = ['name', 'date', 'venue', 'price', 'audience', 'photoUrl']
            let changed = false
            for (const f of fields) {
              if (!String(next[f] || '').trim() && typeof latest[f] === 'string' && latest[f].trim()) {
                next[f] = latest[f]
                changed = true
              }
            }
            if (changed) setToast('Loaded latest saved event')
            return next
          })
        }
      } catch (_e) {
        // Ignore errors (e.g., NO_DB_SAVE or backend not available)
      }
    })()
  }, [location.state])

  const validate = () => {
    const required = ['name', 'date', 'venue', 'price', 'audience', 'photoUrl']
    for (const k of required) {
      if (!String(form[k] || '').trim()) return `${k} is required`
    }
    return ''
  }

  const handleSubmit = async () => {
    const msg = validate()
    if (msg) return setError(msg)
    setError(''); setResult(null); setLoading(true)
    try {
      const data = await autoShare(form)
      setResult(data)
      setToast('Successfully shared to social media! 🎉')
    } catch (e) {
      console.error('Auto-share error:', e)
      const errorMsg = e?.response?.data?.error || 
                       e?.response?.data?.detail || 
                       e?.message || 
                       'Failed to share to social media'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <EventAvailableIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>Event Auto Share</Typography>
        </Stack>

        {loadedFromWizard && (
          <Alert severity="success" sx={{ mb: 3 }}>
            🎨 Poster loaded from AI Wizard! Your generated image is ready to share.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <TextField label="Event Name" name="name" value={form.name} onChange={onChange} fullWidth required />
              <TextField label="Date" name="date" type="date" value={form.date}
                onChange={onChange} fullWidth required InputLabelProps={{ shrink: true }} />
              <TextField label="Venue" name="venue" value={form.venue} onChange={onChange} fullWidth required />
              <TextField label="Ticket Price" name="price" value={form.price} onChange={onChange} fullWidth required
                InputProps={{ startAdornment: <InputAdornment position="start">💵</InputAdornment> }} />
              <TextField label="Audience" name="audience" value={form.audience} onChange={onChange} fullWidth required />
              {/* Hidden input for photoUrl - auto-populated from AI Wizard */}
              <input type="hidden" name="photoUrl" value={form.photoUrl} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />} disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={18} color="inherit" /> : 'Submit'}
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            {preview ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Poster Preview</Typography>
                <Paper variant="outlined" sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={preview}
                    alt="Poster preview"
                    sx={{ maxWidth: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 1 }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </Paper>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Poster image will appear here when loaded from AI Wizard
              </Typography>
            )}
              <Divider sx={{ my: 2 }} />
              {result && (
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle2">Result</Typography>
                  {result.caption && (
                    <Box sx={{ mt: 1.5 }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Auto-generated Caption</Typography>
                      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {result.caption}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                  <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, m: 0, mt: 2 }}>
                    {JSON.stringify(result, null, 2)}
                  </Box>
                </Box>
              )}
            
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
      </Paper>
    </Container>
  )
}
