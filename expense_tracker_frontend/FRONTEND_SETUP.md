# Expense Tracker Frontend Setup

1) Install dependencies
   npm install

2) Configure backend API base URL
   Option A (recommended for dev): Use CRA proxy (configured in package.json) and leave REACT_APP_API_BASE empty.
   - Start backend at http://localhost:4000
   - Start frontend; /api/* calls will be proxied automatically to http://localhost:4000

   Option B: Use absolute base URL
   - Copy .env.example to .env and set:
     REACT_APP_API_BASE=http://localhost:4000

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
- If you see "Unexpected token '<', '<!DOCTYPE' is not valid JSON":
  - The categories endpoint likely returned HTML (e.g., index.html) instead of JSON.
  - Ensure the backend is running at http://localhost:4000.
  - If using proxy, confirm "proxy": "http://localhost:4000" exists in package.json and restart dev server after changes.
  - If using REACT_APP_API_BASE, verify it points to the backend and is set before starting the dev server.

Notes:
- Charts use Recharts, filters use dayjs for date handling.
- CSV export hits the backend /api/export/csv endpoint and triggers a file download.
- Supabase is optional and primarily used for auth in this app as configured.
