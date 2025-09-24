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
