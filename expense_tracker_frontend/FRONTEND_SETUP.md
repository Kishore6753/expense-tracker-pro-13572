# Expense Tracker Frontend Setup

1) Install dependencies
   npm install

2) Configure backend API base URL
   Copy .env.example to .env and set:
   REACT_APP_API_BASE=http://localhost:4000

3) Run the app
   npm start

Notes:
- Charts use Recharts, filters use dayjs for date handling.
- CSV export hits the backend /api/export/csv endpoint and triggers a file download.
