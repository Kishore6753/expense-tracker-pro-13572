//
// PUBLIC_INTERFACE
// api.js - Centralized API client for Expense Tracker frontend.
// Uses REACT_APP_API_BASE env variable (must be provided in .env) to configure backend base URL.
//
const API_BASE =
  process.env.REACT_APP_API_BASE || ''; // Comment: Set REACT_APP_API_BASE in .env to "http://localhost:PORT" or gateway URL

// Helper to build query strings from an object, omitting null/undefined/empty values
function buildQuery(params = {}) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') {
      qp.append(k, v);
    }
  });
  const qs = qp.toString();
  return qs ? `?${qs}` : '';
}

// PUBLIC_INTERFACE
export async function fetchCategories() {
  /** Fetch list of categories from backend.
   * Normalizes responses that may be either:
   * - an array: [{ id, name }, ...]
   * - an object wrapper: { items: [...] } or { data: [...] }
   * Returns a normalized array of { id, name } objects to prevent rendering issues.
   */
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error(`Failed to load categories`);
  const raw = await res.json();
  const data = Array.isArray(raw)
    ? raw
    : (Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : []));

  // Normalize each category to { id, name }
  const normalized = data
    .filter(Boolean)
    .map((c) => {
      // Support possible shapes: {id, name}, {value, label}, {categoryId, categoryName}, {id, label}
      const id = c.id ?? c.categoryId ?? c.value;
      const name = c.name ?? c.categoryName ?? c.label ?? (id != null ? `#${id}` : 'Unknown');
      return { id, name };
    })
    // remove items with missing id
    .filter((c) => c.id !== undefined && c.id !== null);

  return normalized;
}

// PUBLIC_INTERFACE
export async function fetchExpenses(filters = {}) {
  /** Fetch expenses with optional filters: startDate, endDate, categoryId, search, limit, offset, sortBy, sortDir */
  const qs = buildQuery(filters);
  const res = await fetch(`${API_BASE}/api/expenses${qs}`);
  if (!res.ok) throw new Error(`Failed to load expenses`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function createExpense(payload) {
  /** Create a new expense. Payload: {amount, categoryId, notes?, createdAt?} */
  const res = await fetch(`${API_BASE}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create expense`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function updateExpense(id, payload) {
  /** Update an expense by id. Payload may contain partial fields. */
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update expense`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function deleteExpense(id) {
  /** Delete an expense by id. */
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete expense`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchSummary(filters = {}) {
  /** Fetch overall summary: { totalAmount, count } */
  const qs = buildQuery(filters);
  const res = await fetch(`${API_BASE}/api/summary${qs}`);
  if (!res.ok) throw new Error(`Failed to load summary`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchCategorySummary(filters = {}) {
  /** Fetch category summary: list of { categoryId, categoryName, total } */
  const qs = buildQuery(filters);
  const res = await fetch(`${API_BASE}/api/summary/categories${qs}`);
  if (!res.ok) throw new Error(`Failed to load category summary`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function exportCsv(filters = {}) {
  /** Request CSV export for given filters; returns Blob */
  const qs = buildQuery(filters);
  const res = await fetch(`${API_BASE}/api/export/csv${qs}`);
  if (!res.ok) throw new Error(`Failed to export CSV`);
  return res.text(); // backend returns CSV string per openapi
}

// PUBLIC_INTERFACE
export async function fetchChartData(filters = {}) {
  /** Fetch chart-ready data; expect arrays for date series and category series as backend provides. */
  const qs = buildQuery(filters);
  const res = await fetch(`${API_BASE}/api/chart-data${qs}`);
  if (!res.ok) throw new Error(`Failed to load chart data`);
  return res.json();
}

export { API_BASE };
