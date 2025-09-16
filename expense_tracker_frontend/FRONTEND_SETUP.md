# Expense Tracker Frontend Setup

1) Install dependencies
   npm install

2) Configure backend API base URL
   Option A (recommended for dev): Use CRA proxy (configured in package.json) and leave REACT_APP_API_BASE empty.
   - Start backend at http://localhost:4000
   - Ensure package.json has "proxy": "http://localhost:4000"
   - Restart the frontend dev server after any proxy change
   - Start frontend; /api/* calls will be proxied automatically to http://localhost:4000

   Option B: Use absolute base URL
   - Copy .env.example to .env and set:
     REACT_APP_API_BASE=http://localhost:4000
   - Restart the frontend dev server after changing .env

3) Optional: Enable Supabase Authentication
   Add to .env:
   REACT_APP_SUPABASE_URL=<your_supabase_project_url>
   REACT_APP_SUPABASE_KEY=<your_supabase_anon_key>
   REACT_APP_SITE_URL=http://localhost:3000

   In Supabase Dashboard (Auth > URL Configuration):
   - Site URL: http://localhost:3000
   - Redirect URLs: http://localhost:3000/**

   Auth callback route available at /auth/callback component (src/auth/AuthCallback.jsx).
   Wire it into your router if needed.

4) Run the app
   npm start

## Troubleshooting

### A) "Invalid Host Header" in remote/cloud/container dev
This can occur when the CRA dev server blocks unknown hosts (e.g., preview URLs, tunnels, or container hostnames).

Quick fix (development only):
- Copy `.env.example` to `.env`
- Ensure these entries exist (dev-only; never for production):
  HOST=0.0.0.0
  DANGEROUSLY_DISABLE_HOST_CHECK=true
- Restart the dev server: npm start

Notes:
- In this repo, package.json already sets these via cross-env in the start script:
  "start": "cross-env HOST=0.0.0.0 DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start"
- Use the .env approach if you override scripts or run the dev server differently (e.g., docker-compose, custom commands).

Why this happens:
- CRA performs host header checks to protect against DNS rebinding. Remote/cloud URLs may not match localhost, triggering the error.

Warnings:
- Do not use DANGEROUSLY_DISABLE_HOST_CHECK=true in production or public deployments.

### B) Category/API fetch failures and "Unexpected token '<'" errors
- The categories endpoint likely returned HTML (e.g., index.html) or the backend is unreachable.
- Confirm the backend is running at http://localhost:4000 (default).
- If using CRA proxy, ensure package.json includes "proxy": "http://localhost:4000" and restart the dev server after changes.
- If using REACT_APP_API_BASE, verify it points to the backend and is set before starting the dev server.

Diagnostics built into the app:
- The app checks the Content-Type header and logs a preview of non-JSON responses.
- In development, a Diagnostics card appears showing:
  - GET / health status, content-type, and a sample of the body
  - GET /api/categories status, content-type, and a sample of the body

Browser console/network:
- Look for:
  - [fetchCategories] Network failure
  - [fetchCategories] HTTP error with status and response preview
  - "Expected JSON but received non-JSON response" with content-type and body preview
- Use the Network tab to inspect the /api/* calls, response status, content-type, and response body preview.

Common causes:
- Backend not running or wrong port
- Proxy misconfigured (or dev server not restarted)
- API_BASE pointing to a frontend server that returns HTML instead of JSON
- CORS or gateway returning HTML error pages

Notes:
- Charts use Recharts, filters use dayjs for date handling.
- CSV export hits the backend /api/export/csv endpoint and triggers a file download.
- Supabase is optional and primarily used for auth in this app as configured.

For more details, see TROUBLESHOOTING.md.
