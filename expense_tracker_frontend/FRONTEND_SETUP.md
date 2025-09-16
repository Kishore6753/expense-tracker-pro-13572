# Expense Tracker Frontend Setup

1) Install dependencies
   npm install

2) Configure backend API base URL
   Copy .env.example to .env and set:
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

Notes:
- Charts use Recharts, filters use dayjs for date handling.
- CSV export hits the backend /api/export/csv endpoint and triggers a file download.
- Supabase is optional and primarily used for auth in this app as configured.
