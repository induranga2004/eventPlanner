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
# Event Planner Frontend

React + Vite + MUI Sign-in template wired to the backend.

## Scripts

- npm run dev — start dev server (http://localhost:5173)
- npm run build — production build
- npm run preview — preview production build

## Env

Create `.env` (optional). Note: Vite reads env vars at startup, so restart the dev server after editing `.env`.

VITE_API_BASE=http://localhost:4000

Examples:
- For default backend: `VITE_API_BASE=http://localhost:4000`
- If using a different port: `VITE_API_BASE=http://localhost:3000`

## Pages

- /login — Sign In
- /register — Sign Up
- /me — Profile (protected)

## Structure

```
src/
	auth/
		api.js          # login/register API
		SignIn.jsx
		SignUp.jsx
	lib/
		apiClient.js    # shared Axios client (uses VITE_API_BASE)
	pages/
		Profile.jsx     # protected profile page
	api.js            # non-auth API (me)
	main.jsx          # router + theme
```
