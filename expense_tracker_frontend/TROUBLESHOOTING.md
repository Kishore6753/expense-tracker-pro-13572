# Frontend Troubleshooting Guide

This guide covers common development-time issues including "Invalid Host Header" errors and API fetch failures.

## 1) "Invalid Host Header" (CRA dev server)

Symptoms:
- Browser shows "Invalid Host Header"
- Dev server runs in a remote/cloud/container environment (e.g., preview URLs, tunnels)

Cause:
- Create React App dev server protects against DNS rebinding by checking the Host header.
- Remote/cloud URLs or tunnels may not match localhost, triggering the block.

Fix (development only):
1. Copy `.env.example` to `.env`
2. Ensure these entries exist:
   HOST=0.0.0.0
   DANGEROUSLY_DISABLE_HOST_CHECK=true
3. Restart the dev server: `npm start`

Notes:
- This repository’s package.json already sets these via cross-env for convenience:
  "start": "cross-env HOST=0.0.0.0 DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start"
- Use the .env approach if you override scripts or run via different tooling (e.g., docker-compose).

Security warning:
- Do NOT set DANGEROUSLY_DISABLE_HOST_CHECK=true in production or public deployments.

## 2) Category/API fetch failures or "Unexpected token '<'" errors

Symptoms:
- UI banner: "Category Load Error"
- Console logs:
  - [fetchCategories] Network failure
  - [fetchCategories] HTTP error with status and response preview
  - "Expected JSON but received non-JSON response"
- Network tab shows HTML responses or incorrect content-type

Likely causes:
- Backend not running or wrong port
- CRA proxy misconfigured or dev server not restarted after changes
- REACT_APP_API_BASE points to the wrong service (e.g., frontend server returning index.html)
- CORS/gateway issues returning HTML error pages

Checklist:
- If using CRA proxy:
  - Check package.json includes `"proxy": "http://localhost:4000"`
  - Restart dev server after changing proxy
- If using absolute base URL:
  - Set `REACT_APP_API_BASE=http://localhost:4000` in `.env`
  - Restart dev server after changing `.env`
- Ensure backend is reachable directly (curl or browser):
  - GET http://localhost:4000/ should return JSON health
  - GET http://localhost:4000/api/categories should return JSON

Diagnostics built into the app:
- In development, a Diagnostics card shows:
  - GET / health: status, content-type, and a body sample
  - GET /api/categories: status, content-type, and a body sample
- Additional console logs include response previews for non-JSON and error statuses.

## 3) Supabase auth redirects

If using Supabase auth:
- Set in `.env`:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY
  - REACT_APP_SITE_URL (e.g., http://localhost:3000)
- In Supabase Dashboard > Authentication > URL Configuration:
  - Site URL: http://localhost:3000 (for local dev)
  - Redirect URLs: http://localhost:3000/**
- See assets/supabase.md for more information.

## 4) When to use .env vs. scripts

- Use `.env` when running the dev server via alternative tools or when you prefer environment-based configuration.
- The included `npm start` script already sets HOST and disables host check for development in this repo.
- After any `.env` changes, always restart the dev server.

