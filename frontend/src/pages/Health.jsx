import React, { useEffect, useState } from 'react'
import { Container, Paper, Typography, Stack, Button } from '@mui/material'
import { api } from '../api/apiClient'

export default function Health() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      const { data } = await api.get('/')
      setData(data)
      setError(null)
    } catch (e) {
      setError(e.message || String(e))
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Backend Health</Typography>
        <Button onClick={load} variant="outlined">Refresh</Button>
        {error && <Paper sx={{ p: 2, color: 'error.main' }}>{error}</Paper>}
        {data && (
          <Paper sx={{ p: 2 }}>
            <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}
