import { useState, useMemo, useEffect } from 'react'
import {
  Box, Container, Paper, Typography, TextField, Grid, Button, Stack,
  Alert, Snackbar, CircularProgress, Divider, InputAdornment
} from '@mui/material'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import ImageIcon from '@mui/icons-material/Image'
import SaveIcon from '@mui/icons-material/Save'
import { autoShare, getLatestEvent } from '../api/events'

export default function AutoShare() {
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

  const preview = useMemo(() => form.photoUrl?.trim() || '', [form.photoUrl])

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  // Prefill the form with the latest event saved in MongoDB (if available)
  // This runs only once on mount and won't override any user edits afterward.
  useEffect(() => {
    (async () => {
      try {
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
  }, [])

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
      setToast(data.saved === false ? 'Auto share done (no DB save mode)' : 'Auto share saved')
    } catch (e) {
      const upstreamErr = e?.response?.data?.upstream?.error
      setError(upstreamErr || e?.response?.data?.error || e.message)
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
              <TextField label="Poster Image URL" name="photoUrl" value={form.photoUrl} onChange={onChange} fullWidth required
                InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small" /></InputAdornment> }} />
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
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview</Typography>
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
              <Typography variant="body2" color="text.secondary">Enter a public image URL to see a preview here.</Typography>
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
