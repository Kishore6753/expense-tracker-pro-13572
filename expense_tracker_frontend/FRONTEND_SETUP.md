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

Troubleshooting:
- If you see "Unexpected token '<', '<!DOCTYPE' is not valid JSON" or the "Category Load Error" banner:
  - The categories endpoint likely returned HTML or non-JSON (e.g., index.html) or the backend is unreachable.
  - Confirm the backend is running at http://localhost:4000 (default).
  - If using CRA proxy, ensure package.json includes "proxy": "http://localhost:4000" and restart the dev server after changes.
  - If using REACT_APP_API_BASE, verify it points to the backend and is set before starting the dev server.
  - The app checks the Content-Type header and will log detailed diagnostics to the console if non-JSON is returned (including a short preview of the body).
  - In development, App shows a Diagnostics card with:
    - GET / health status, content-type, and a sample of the body (JSON when possible)
    - GET /api/categories status, content-type, and a sample of the body
  - Open the browser console to see:
    - [fetchCategories] Network failure (if fetch fails entirely)
    - [fetchCategories] HTTP error with status and response preview
    - Expected JSON but received non-JSON response (includes content-type and body preview)
  - Common causes:
    - Backend not running or wrong port
    - Proxy misconfigured (or dev server not restarted)
    - API_BASE pointing to a frontend server that returns HTML instead of API JSON
    - CORS or gateway misroutes returning HTML error pages

Notes:
- Charts use Recharts, filters use dayjs for date handling.
- CSV export hits the backend /api/export/csv endpoint and triggers a file download.
- Supabase is optional and primarily used for auth in this app as configured.
