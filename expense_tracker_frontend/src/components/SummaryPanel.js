import React from 'react';

// PUBLIC_INTERFACE
export default function SummaryPanel({ overall, categorySummary }) {
  /** Displays overall totals and category breakdown. */
  const total = overall?.totalAmount ?? 0;
  const count = overall?.count ?? 0;

  return (
    <div className="row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
      <div className="card" style={{ flex: 1, minWidth: 240 }}>
        <div className="card-header" style={{ fontWeight: 600 }}>Summary</div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>${Number(total).toFixed(2)}</div>
          <div style={{ color: 'var(--text-secondary)' }}>{count} expenses</div>
        </div>
      </div>
      <div className="card" style={{ flex: 2, minWidth: 300 }}>
        <div className="card-header" style={{ fontWeight: 600 }}>By Category</div>
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Category</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(!categorySummary || categorySummary.length === 0) && (
                <tr><td colSpan={2} style={{ textAlign: 'center', padding: 12 }}>No data</td></tr>
              )}
              {categorySummary?.map((c) => (
                <tr key={c.categoryId ?? c.categoryName}>
                  <td>{c.categoryName ?? `#${c.categoryId}`}</td>
                  <td style={{ textAlign: 'right' }}>${Number(c.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
