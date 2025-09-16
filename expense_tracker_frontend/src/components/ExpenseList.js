import React, { useState } from 'react';
import dayjs from 'dayjs';

// PUBLIC_INTERFACE
export default function ExpenseList({ expenses, categoriesById, onUpdate, onDelete }) {
  /** Renders expenses with inline editing and delete. */
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setDraft({
      amount: exp.amount,
      categoryId: exp.categoryId,
      notes: exp.notes || '',
      createdAt: dayjs(exp.createdAt).format('YYYY-MM-DD'),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const commitEdit = () => {
    if (!editingId) return;
    const payload = {
      amount: parseFloat(draft.amount),
      categoryId: parseInt(draft.categoryId, 10),
      notes: draft.notes || undefined,
      createdAt: dayjs(draft.createdAt).toISOString(),
    };
    onUpdate(editingId, payload);
    cancelEdit();
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header" style={{ fontWeight: 600 }}>Expenses</div>
      <div className="table-responsive">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Date</th>
              <th style={{ textAlign: 'left' }}>Category</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'left' }}>Notes</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16 }}>No expenses found.</td></tr>
            )}
            {expenses.map(exp => {
              const isEditing = editingId === exp.id;
              if (isEditing) {
                return (
                  <tr key={exp.id}>
                    <td>
                      <input
                        type="date"
                        value={draft.createdAt}
                        onChange={(e) => setDraft(prev => ({ ...prev, createdAt: e.target.value }))}
                      />
                    </td>
                    <td>
                      <select
                        value={draft.categoryId}
                        onChange={(e) => setDraft(prev => ({ ...prev, categoryId: e.target.value }))}
                      >
                        {Object.entries(categoriesById).map(([id, cat]) => (
                          <option key={id} value={id}>{cat.name ?? cat.label ?? `#${id}`}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={draft.amount}
                        onChange={(e) => setDraft(prev => ({ ...prev, amount: e.target.value }))}
                        style={{ textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        value={draft.notes}
                        onChange={(e) => setDraft(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-small" onClick={commitEdit}>Save</button>
                      <button className="btn btn-secondary btn-small" onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>
                    </td>
                  </tr>
                );
              }
              const categoryName = categoriesById[exp.categoryId]?.name ?? `#${exp.categoryId}`;
              return (
                <tr key={exp.id}>
                  <td>{dayjs(exp.createdAt).format('YYYY-MM-DD')}</td>
                  <td>{categoryName}</td>
                  <td style={{ textAlign: 'right' }}>${Number(exp.amount).toFixed(2)}</td>
                  <td>{exp.notes || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-outline btn-small" onClick={() => startEdit(exp)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => onDelete(exp.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
