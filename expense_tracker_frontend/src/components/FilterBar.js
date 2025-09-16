import React from 'react';
import dayjs from 'dayjs';

// PUBLIC_INTERFACE
export default function FilterBar({ filters, setFilters, categories, onApply, onReset, onExportCsv }) {
  /** Filter bar with start/end date, category, search, and action buttons. */
  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  return (
    <div className="card" style={{ width: '100%', marginBottom: 16 }}>
      <div className="card-header" style={{ fontWeight: 600, marginBottom: 8 }}>Filters</div>
      <div className="row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="col">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate ? dayjs(filters.startDate).format('YYYY-MM-DD') : ''}
            onChange={(e) => {
              const val = e.target.value ? dayjs(e.target.value).startOf('day').toISOString() : '';
              setFilters(prev => ({ ...prev, startDate: val }));
            }}
          />
        </div>
        <div className="col">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate ? dayjs(filters.endDate).format('YYYY-MM-DD') : ''}
            onChange={(e) => {
              const val = e.target.value ? dayjs(e.target.value).endOf('day').toISOString() : '';
              setFilters(prev => ({ ...prev, endDate: val }));
            }}
          />
        </div>
        <div className="col">
          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" value={filters.categoryId || ''} onChange={onChange}>
            <option value="">{Array.isArray(categories) && categories.length > 0 ? 'All' : 'No categories'}</option>
            {Array.isArray(categories) && categories.map((c) => {
              const id = (c.id ?? c.value ?? c.categoryId);
              const label = (c.name ?? c.label ?? c.categoryName ?? `#${id}`);
              if (id === undefined || id === null) return null;
              return (
                <option key={String(id)} value={String(id)}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col" style={{ flex: 1 }}>
          <label htmlFor="search">Search Notes</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search || ''}
            onChange={onChange}
            placeholder="e.g., lunch, uber..."
          />
        </div>
        <div className="col">
          <button className="btn" onClick={onApply} aria-label="Apply filters">Apply</button>
        </div>
        <div className="col">
          <button className="btn btn-secondary" onClick={onReset} aria-label="Reset filters">Reset</button>
        </div>
        <div className="col">
          <button className="btn btn-outline" onClick={onExportCsv} aria-label="Export CSV">Export CSV</button>
        </div>
      </div>
    </div>
  );
}
