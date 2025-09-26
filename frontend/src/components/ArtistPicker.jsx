import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box, CircularProgress, Checkbox, Typography } from '@mui/material'
import { DesignAPI } from '../services/designApi'

export default function ArtistPicker({ open, onClose, onConfirm, defaultLink = '13ttHg4UfqtrR67m0MH_K2XmzsO36Gxrz' }) {
	const [link, setLink] = useState(defaultLink)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [items, setItems] = useState([])
	const [selected, setSelected] = useState({})
		const [manualUrl, setManualUrl] = useState("")

	useEffect(() => {
		if (!open) return
		setError(null)
		setLoading(true)
		DesignAPI.listArtists(link)
			.then(data => {
				setItems(data.items || [])
			})
			.catch(e => setError(String(e)))
			.finally(() => setLoading(false))
	}, [open, link])

	const toggle = (id) => {
		setSelected(prev => ({ ...prev, [id]: !prev[id] }))
	}

	const handleConfirm = () => {
		const chosen = items.filter(it => selected[it.id])
		onConfirm?.(chosen)
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle>Select Artists</DialogTitle>
			<DialogContent dividers>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
					<TextField fullWidth label="Google Drive folder link or ID" value={link} onChange={e => setLink(e.target.value)} />
					<Button onClick={() => {
						setLoading(true)
						setError(null)
						DesignAPI.listArtists(link)
							.then(data => setItems(data.items || []))
							.catch(e => setError(String(e)))
							.finally(() => setLoading(false))
					}}>Load</Button>
				</Box>
				{loading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress size={26} /></Box>
				)}
				{error && (
					<Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
				)}
						{!loading && items.length === 0 && (
							<>
								<Typography variant="body2" sx={{ mb: 1 }}>No items found. Ensure the Drive folder is public. You can also add a direct image URL below.</Typography>
								<Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
									<TextField fullWidth label="Direct Image URL (PNG with transparent BG preferred)" value={manualUrl} onChange={e => setManualUrl(e.target.value)} />
									<Button onClick={() => {
										if (!manualUrl) return
										const id = `manual_${Date.now()}`
										setItems([{ id, label: 'Manual', url: manualUrl }])
										setSelected({ [id]: true })
									}}>Add</Button>
								</Box>
							</>
						)}
				<Grid container spacing={2}>
														{items.map(it => (
						<Grid item xs={6} sm={4} md={3} key={it.id}>
							<Box sx={{ position: 'relative', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }} onClick={() => toggle(it.id)}>
																	<img
																		src={it.id ? `${import.meta.env.VITE_API_BASE_URL}/api/design/drive-image?id=${it.id}&size=400` : (it.thumb || it.view || it.url || it.raw || it.dl || it.dl2)}
															alt={it.label}
															style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
															referrerPolicy="no-referrer"
															crossOrigin="anonymous"
															onError={(e) => {
																const order = [it.view, it.url, it.raw, it.dl, it.dl2]
																const next = order.find(u => u && u !== e.currentTarget.src)
																if (next) e.currentTarget.src = next
															}}
														/>
								<Box sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 0.5 }}>
									<Checkbox checked={!!selected[it.id]} size="small" />
								</Box>
							</Box>
						</Grid>
					))}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button variant="contained" onClick={handleConfirm}>Add Selected</Button>
			</DialogActions>
		</Dialog>
	)
}

