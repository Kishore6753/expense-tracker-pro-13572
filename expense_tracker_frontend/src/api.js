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

/**
 * INTERNAL: Safely parse JSON only when the content-type indicates JSON.
 * If the response is HTML/text, return null to allow graceful handling.
 */
async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.toLowerCase().includes('application/json')) {
    // Try to read text for better diagnostics
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('Expected JSON but received non-JSON response.', {
      status: res.status,
      url: res.url,
      contentType: ct,
      preview: text?.slice(0, 200),
    });
    return null;
  }
  try {
    return await res.json();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse JSON response', { url: res.url, error: e });
    return null;
  }
}

 // PUBLIC_INTERFACE
export async function fetchCategories() {
  /** Fetch list of categories from backend.
   * IMPORTANT: The backend returns an object with a `data` property that holds the array of categories.
   * We intentionally prioritize `raw.data` and include robust fallbacks for legacy/alternative shapes:
   * - { data: [...] }  <-- primary/expected
   * - { items: [...] } <-- fallback
   * - [ ... ]          <-- fallback if API returns array directly
   *
   * Returns a normalized array of { id, name } objects to prevent rendering issues if the API structure changes.
   */
  const url = `${API_BASE}/api/categories`;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (e) {
    const msg = `Network error while loading categories: ${e?.message || e}`;
    // eslint-disable-next-line no-console
    console.error(msg);
    const err = new Error(msg);
    err.code = 'NETWORK';
    throw err;
  }
  if (!res.ok) {
    // Try to capture body preview for diagnostics
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    const msg = `Failed to load categories: status ${res.status}. Preview: ${preview}`;
    // eslint-disable-next-line no-console
    console.error(msg);
    const err = new Error(msg);
    err.code = 'HTTP';
    err.status = res.status;
    throw err;
  }
  const raw = await safeJson(res);
  if (!raw) {
    const err = new Error('Categories endpoint returned non-JSON (HTML or text). Check API_BASE or dev proxy/back-end status.');
    err.code = 'NON_JSON';
    throw err;
  }

  // Always prefer `data` as per requirement, with fallbacks.
  const source = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
      ? raw.items
      : (Array.isArray(raw) ? raw : []);

  // Normalize each category to { id, name }
  const normalized = source
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
