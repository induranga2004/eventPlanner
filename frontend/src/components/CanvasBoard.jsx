import React, { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { getFabric } from '../lib/fabricLoader'

export default function CanvasBoard({ width = 800, height = 600, onReady = undefined }) {
  // eslint-disable-next-line no-console
  console.info('[CanvasBoard] render with props', { hasOnReady: typeof onReady, width, height })
  const elRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info('[CanvasBoard] effect start')
    let cancelled = false
    ;(async () => {
      try {
        const fabric = await getFabric()
        if (cancelled) return
        if (!elRef.current) { setError('Canvas element not ready'); return }
        const c = new fabric.Canvas(elRef.current, { width, height, backgroundColor: '#fff' })
        if (typeof onReady === 'function') onReady(c)
      } catch (e) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [width, height, onReady])

  return (
    <Box sx={{ position: 'relative', width, height, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {error && (
        <Box sx={{ position: 'absolute', inset: 0, p: 2, color: 'error.main' }}>{error}</Box>
      )}
      <canvas ref={elRef} />
    </Box>
  )
}
