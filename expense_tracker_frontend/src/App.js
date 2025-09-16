import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import {
  fetchCategories, fetchExpenses, createExpense, updateExpense, deleteExpense,
  fetchSummary, fetchCategorySummary, exportCsv, fetchChartData, API_BASE
} from './api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import SummaryPanel from './components/SummaryPanel';
import FilterBar from './components/FilterBar';
import ChartsPanel from './components/ChartsPanel';
import { runApiDiagnostics } from './utils/diagnostics';

// PUBLIC_INTERFACE
function App() {
  /** Main Expense Tracker UI. */
  const [theme, setTheme] = useState('light');
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [overall, setOverall] = useState(null);
  const [catSummary, setCatSummary] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [diagnostics, setDiagnostics] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    search: '',
    limit: 50,
    offset: 0,
    sortBy: 'created_at',
    sortDir: 'DESC',
  });

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const categoriesById = useMemo(() => {
    const map = {};
    (Array.isArray(categories) ? categories : []).forEach((c) => {
      const key = c?.id ?? c?.value;
      if (key !== undefined && key !== null) {
        map[String(key)] = c;
      }
    });
    return map;
  }, [categories]);

  const loadAll = async (opts = {}) => {
    setLoading(true);
    try {
      const effective = { ...filters, ...opts };
      let catErr = '';
      const [cats, exps, sum, catSum, chart] = await Promise.all([
        (async () => {
          try {
            const c = await fetchCategories();
            return c;
          } catch (e) {
            const message = String(e?.message || e || 'Failed to load categories');
            // eslint-disable-next-line no-console
            console.error('Categories load failed:', {
              error: e,
              message,
              apiBase: API_BASE || '(proxy/relative)',
            });
            catErr = message;
            if (message.toLowerCase().includes('non-json')) {
              catErr += ' — API returned HTML instead of JSON. Ensure backend is running and API base/proxy is configured.';
            }
            return [];
          }
        })(),
        fetchExpenses(effective),
        fetchSummary(effective),
        fetchCategorySummary(effective),
        fetchChartData(effective),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setExpenses(exps?.items ?? exps ?? []);
      setOverall(sum);
      setCatSummary(catSum);
      setChartData(chart);
      setCategoryError(catErr);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[loadAll] Failed to load data', e);
      alert('Failed to load data from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load without filters
    if (process.env.NODE_ENV === 'development') {
      runApiDiagnostics(API_BASE)
        .then((res) => setDiagnostics(res))
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('Diagnostics failed', err);
          setDiagnostics({ error: String(err) });
        });
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilters = () => loadAll();
  const onResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      search: '',
      limit: 50,
      offset: 0,
      sortBy: 'created_at',
      sortDir: 'DESC',
    });
    loadAll({
      startDate: '',
      endDate: '',
      categoryId: '',
      search: '',
      limit: 50,
      offset: 0,
      sortBy: 'created_at',
      sortDir: 'DESC',
    });
  };

  const handleCreateExpense = async (payload) => {
    try {
      await createExpense(payload);
      await loadAll();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[handleCreateExpense] Failed', e);
      alert('Failed to create expense.');
    }
  };

  const handleUpdateExpense = async (id, payload) => {
    try {
      await updateExpense(id, payload);
      await loadAll();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[handleUpdateExpense] Failed', e);
      alert('Failed to update expense.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id)); // optimistic update
      await loadAll();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[handleDeleteExpense] Failed', e);
      alert('Failed to delete expense.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const csvText = await exportCsv(filters);
      // Download CSV by creating a blob and link
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[handleExportCsv] Failed', e);
      alert('Failed to export CSV.');
    }
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="App">
      <div className="navbar">
        <div className="brand">💸 Expense Tracker</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            API: {API_BASE || 'relative'}
          </span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      <div className="container">
        {categoryError && (
          <div className="card" style={{ marginBottom: 12, borderColor: 'var(--danger-bg)' }}>
            <div style={{ color: 'var(--danger-bg)', fontWeight: 600, marginBottom: 6 }}>Category Load Error</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{categoryError}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
              Tips: Ensure backend is running and reachable. If using CRA proxy, confirm package.json has "proxy": "http://localhost:4000"
              and restart the dev server after changes. Or set REACT_APP_API_BASE to the full backend URL and restart the dev server.
            </div>
          </div>
        )}
        {process.env.NODE_ENV === 'development' && diagnostics && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header" style={{ fontWeight: 600 }}>Diagnostics</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              API Base: {API_BASE || '(proxy/relative)'}<br/>
              Health: {diagnostics.health ? JSON.stringify(diagnostics.health) : 'n/a'}<br/>
              Categories: {diagnostics.categories ? JSON.stringify(diagnostics.categories) : 'n/a'}
            </div>
          </div>
        )}
        <ExpenseForm categories={categories} onSubmit={handleCreateExpense} />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onApply={onApplyFilters}
          onReset={onResetFilters}
          onExportCsv={handleExportCsv}
        />
        <SummaryPanel overall={overall} categorySummary={catSummary} />
        <ChartsPanel chartData={chartData} />
        {loading && <div className="card" style={{ marginTop: 16 }}>Loading...</div>}
        <ExpenseList
          expenses={expenses}
          categoriesById={categoriesById}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />

        <div className="footer-note">
          Tip: Set REACT_APP_API_BASE in your .env to point to the backend (e.g., http://localhost:4000).
        </div>
      </div>
    </div>
  );
}

export default App;
