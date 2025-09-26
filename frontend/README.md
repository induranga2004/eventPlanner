Minimal Frontend (Clean)

What’s included:
- Home page linking to Editor and Backend Health
- Editor page with buttons to:
	- Analyze query via /api/intelligence/analyze
	- Start L1 via /api/design/start and set canvas background
	- Harmonize L2 via /api/design/harmonize and update background
- Health page that calls GET /

Config:
- Set VITE_API_BASE_URL in .env (default http://localhost:8000)

Run:
- npm run dev

Structure:
```
src/
	api/
		apiClient.js
	components/
		AppShell.jsx
		CanvasBoard.jsx
	lib/
		fabricLoader.js
	pages/
		Home.jsx
		Health.jsx
		Editor.jsx
	main.jsx
```
