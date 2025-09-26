import React, { useState, useCallback } from 'react'
import AppShell from '../components/AppShell'
import CanvasBoard from '../components/CanvasBoard'
import { api } from '../api/apiClient'
import { Container, Stack, Paper, Typography, Button, TextField } from '@mui/material'
import { getFabric } from '../lib/fabricLoader'
import ArtistPicker from '../components/ArtistPicker'

export default function Editor() {
  const [canvas, setCanvas] = useState(null)
  const [query, setQuery] = useState('mahinda mahaththaya with nelum kuluna colombo')
  const [intelligence, setIntelligence] = useState(null)
  const [startResp, setStartResp] = useState(null)
  const [harmResp, setHarmResp] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedArtists, setSelectedArtists] = useState([])

  const onReady = useCallback((c) => setCanvas(c), [])

  const runAnalyze = async () => {
    const { data } = await api.post('/api/intelligence/analyze', { query, context: 'poster design', language: 'mixed' })
    setIntelligence(data)
  }

  const runStart = async () => {
    const payload = {
      campaign_id: 'demo-campaign',
      event: { title: 'City Night Concert', city: 'Colombo', date: '2025-12-24', audience: 'general', genre: 'electronic' },
      artists: (selectedArtists.length ? selectedArtists : [
        { id: 'a1', name: 'Lead Artist', cutout_url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/User_icon_BLACK-01.png' }
      ]).map((it, idx) => ({ id: it.id || `a${idx+1}`, name: it.label || `Artist ${idx+1}`, cutout_url: it.raw || it.view || it.url })),
      style_prefs: { mood: 'neon', palette: ['#9D00FF', '#00FFD1'], sizes: ['square'] }
    }
    const { data } = await api.post('/api/design/start', payload)
    setStartResp(data)

    const bg = data?.variants?.[0]?.layers?.l1_background_url
    if (bg && canvas) {
      // Load image and set as Fabric background
      const img = await new Promise((resolve) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.src = bg
      })
      const fabric = await getFabric()
      const fabricImg = new fabric.Image(img, { left: 0, top: 0, selectable: false })
      // Fit to canvas (use getters to be compatible with Fabric v6)
      const cw = typeof canvas.getWidth === 'function' ? canvas.getWidth() : (canvas.width || 0)
      const ch = typeof canvas.getHeight === 'function' ? canvas.getHeight() : (canvas.height || 0)
      const scale = Math.min(cw / img.width, ch / img.height)
      if (isFinite(scale) && scale > 0) {
        fabricImg.scale(scale)
      }
      canvas.setBackgroundImage(fabricImg, () => canvas.renderAll())
    }
  }

  const runHarmonize = async () => {
    const bg = startResp?.variants?.[0]?.layers?.l1_background_url
    if (!bg) return
    const payload = {
      render_id: startResp.render_id,
      campaign_id: startResp.campaign_id,
      size: 'square',
      bg_url: bg,
      selected_cutouts: (selectedArtists.length ? selectedArtists : [
        { id: 'a1', label: 'Lead Artist', url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/User_icon_BLACK-01.png' }
      ]).map((it, idx) => ({ artist_id: it.id || `a${idx+1}`, url: it.raw || it.view || it.url, visible: true, bbox: [150 + idx*220, 900, 400, 600], z: 3 + idx })),
      seed_harmonize: 123
    }
    const { data } = await api.post('/api/design/harmonize', payload)
    setHarmResp(data)

    const comp = data?.l2_composite_url
    if (comp && canvas) {
      const img = await new Promise((resolve) => {
        const el = new Image()
        el.crossOrigin = 'anonymous'
        el.onload = () => resolve(el)
        el.src = comp
      })
      const fabric = await getFabric()
      const fabricImg = new fabric.Image(img, { left: 0, top: 0, selectable: false })
      const cw = typeof canvas.getWidth === 'function' ? canvas.getWidth() : (canvas.width || 0)
      const ch = typeof canvas.getHeight === 'function' ? canvas.getHeight() : (canvas.height || 0)
      const scale = Math.min(cw / img.width, ch / img.height)
      if (isFinite(scale) && scale > 0) {
        fabricImg.scale(scale)
      }
      canvas.setBackgroundImage(fabricImg, () => canvas.renderAll())
    }
  }

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Editor</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField fullWidth label="Design query" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button variant="outlined" onClick={runAnalyze}>Analyze</Button>
            <Button variant="contained" onClick={runStart}>Start L1</Button>
            <Button variant="contained" color="secondary" onClick={runHarmonize} disabled={!startResp}>Harmonize L2</Button>
            <Button variant="outlined" onClick={() => setPickerOpen(true)}>Add Artists</Button>
          </Stack>
          <ArtistPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onConfirm={(chosen) => { setSelectedArtists(chosen); setPickerOpen(false) }} />
          <CanvasBoard width={800} height={600} onReady={onReady} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1">Intelligence</Typography>
              <pre style={{ margin: 0 }}>{intelligence ? JSON.stringify(intelligence, null, 2) : '—'}</pre>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1">L1 Start</Typography>
              <pre style={{ margin: 0 }}>{startResp ? JSON.stringify(startResp, null, 2) : '—'}</pre>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1">L2 Harmonize</Typography>
              <pre style={{ margin: 0 }}>{harmResp ? JSON.stringify(harmResp, null, 2) : '—'}</pre>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </AppShell>
  )
}
