/**
 * PUBLIC_INTERFACE
 * api.js - Centralized API client for Expense Tracker frontend.
 * Uses REACT_APP_API_BASE env variable (if provided) or CRA proxy (relative calls).
 * Diagnostics-first: surfaces clear errors for non-JSON and network issues.
 */
const API_BASE =
  process.env.REACT_APP_API_BASE || ''; // Set REACT_APP_API_BASE in .env to "http://localhost:PORT" or gateway URL

/**
 * INTERNAL: Build query string from object, omitting null/undefined/empty values.
 */
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
 * INTERNAL: Attempt to parse JSON only when content-type indicates JSON.
 * Returns { json: any|null, nonJsonPreview: string|null, contentType: string }
 * - json is null if non-JSON or parse failed
 * - nonJsonPreview includes first 200 chars of body for diagnostics when not JSON
 */
async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  const lower = ct.toLowerCase();
  if (!lower.includes('application/json')) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('Expected JSON but received non-JSON response.', {
      status: res.status,
      url: res.url,
      contentType: ct,
      preview: text?.slice(0, 200),
    });
    return { json: null, nonJsonPreview: text?.slice(0, 200) || '', contentType: ct };
  }
  try {
    const parsed = await res.json();
    return { json: parsed, nonJsonPreview: null, contentType: ct };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse JSON response', { url: res.url, error: e });
    return { json: null, nonJsonPreview: null, contentType: ct };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch list of categories from backend and normalize.
 * Normalizes output to [{ id, name }, ...].
 */
export async function fetchCategories() {
  const url = `${API_BASE}/api/categories`;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (e) {
    const msg = `Network error while loading categories: ${e?.message || e}`;
    // eslint-disable-next-line no-console
    console.error('[fetchCategories] Network failure', { url, error: e });
    const err = new Error(msg);
    err.code = 'NETWORK';
    throw err;
  }

  if (!res.ok) {
    // Capture body preview for diagnostics even on non-2xx
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    const msg = `Failed to load categories: status ${res.status}. Preview: ${preview}`;
    // eslint-disable-next-line no-console
    console.error('[fetchCategories] HTTP error', { url, status: res.status, preview });
    const err = new Error(msg);
    err.code = 'HTTP';
    err.status = res.status;
    throw err;
  }

  const { json: raw, nonJsonPreview, contentType } = await safeJson(res);
  if (!raw) {
    const err = new Error(
      `Categories endpoint returned non-JSON (Content-Type: ${contentType || 'unknown'}).` +
      ` Preview: ${nonJsonPreview || '(empty)'}`
    );
    err.code = 'NON_JSON';
    throw err;
  }

  // Prefer raw.data, fallbacks to raw.items or array root
  const source = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
      ? raw.items
      : (Array.isArray(raw) ? raw : []);

  const normalized = source
    .filter(Boolean)
    .map((c) => {
      const id = c.id ?? c.categoryId ?? c.value;
      const name = c.name ?? c.categoryName ?? c.label ?? (id != null ? `#${id}` : 'Unknown');
      return { id, name };
    })
    .filter((c) => c.id !== undefined && c.id !== null);

  // Dev aid: log if the array is unexpectedly empty
  if (normalized.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('[fetchCategories] Parsed categories array is empty. Check backend seed or response format.', { raw });
  }

  return normalized;
}

// PUBLIC_INTERFACE
export async function fetchExpenses(filters = {}) {
  /** Fetch expenses with optional filters: startDate, endDate, categoryId, search, limit, offset, sortBy, sortDir */
  const qs = buildQuery(filters);
  const url = `${API_BASE}/api/expenses${qs}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to load expenses: ${res.status}. ${preview}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function createExpense(payload) {
  /** Create a new expense. Payload: {amount, categoryId, notes?, createdAt?} */
  const url = `${API_BASE}/api/expenses`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to create expense: ${res.status}. ${preview}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function updateExpense(id, payload) {
  /** Update an expense by id. Payload may contain partial fields. */
  const url = `${API_BASE}/api/expenses/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to update expense: ${res.status}. ${preview}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function deleteExpense(id) {
  /** Delete an expense by id. */
  const url = `${API_BASE}/api/expenses/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Accept: 'application/json' } });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to delete expense: ${res.status}. ${preview}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchSummary(filters = {}) {
  /** Fetch overall summary: { totalAmount, count } */
  const qs = buildQuery(filters);
  const url = `${API_BASE}/api/summary${qs}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to load summary: ${res.status}. ${preview}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchCategorySummary(filters = {}) {
  /** Fetch category summary: list of { categoryId, categoryName, total } */
  const qs = buildQuery(filters);
  const url = `${API_BASE}/api/summary/categories${qs}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to load category summary: ${res.status}. ${preview}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function exportCsv(filters = {}) {
  /** Request CSV export for given filters and return CSV string */
  const qs = buildQuery(filters);
  const url = `${API_BASE}/api/export/csv${qs}`;
  const res = await fetch(url, { headers: { Accept: 'text/csv,application/octet-stream,*/*' } });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to export CSV: ${res.status}. ${preview}`);
  }
  return res.text();
}

// PUBLIC_INTERFACE
export async function fetchChartData(filters = {}) {
  /** Fetch chart-ready data; expect arrays for date series and category series as backend provides. */
  const qs = buildQuery(filters);
  const url = `${API_BASE}/api/chart-data${qs}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    let preview = '';
    try { preview = (await res.text()).slice(0, 200); } catch (_) {}
    throw new Error(`Failed to load chart data: ${res.status}. ${preview}`);
  }
  return res.json();
}

export { API_BASE };
