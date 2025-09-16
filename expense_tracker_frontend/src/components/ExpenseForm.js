import React, { useState } from 'react';
import dayjs from 'dayjs';

// PUBLIC_INTERFACE
export default function ExpenseForm({ categories, onSubmit }) {
  /** A form to add a new expense. */
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [createdAt, setCreatedAt] = useState(dayjs().format('YYYY-MM-DD'));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!categoryId) {
      alert('Please select a category.');
      return;
    }
    onSubmit({
      amount: amt,
      categoryId: parseInt(categoryId, 10),
      notes: notes || undefined,
      createdAt: dayjs(createdAt).toISOString(),
    });
    setAmount('');
    setCategoryId('');
    setNotes('');
    setCreatedAt(dayjs().format('YYYY-MM-DD'));
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header" style={{ fontWeight: 600 }}>Add Expense</div>
      <form onSubmit={handleSubmit} className="row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="col">
          <label htmlFor="amount">Amount</label>
          <input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <div className="col">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="categoryId"
            aria-label="Select category"
            value={String(categoryId || '')}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled>
              {Array.isArray(categories) && categories.length > 0 ? 'Select category' : 'No categories available'}
            </option>
            {Array.isArray(categories) &&
              categories
                .filter(Boolean)
                .map((c) => {
                  // c expected normalized to {id, name}; still handle legacy shapes safely
                  const id = c.id ?? c.value ?? c.categoryId;
                  if (id === undefined || id === null) return null;
                  const label = c.name ?? c.label ?? c.categoryName ?? `#${id}`;
                  return (
                    <option key={String(id)} value={String(id)}>
                      {label}
                    </option>
                  );
                })}
          </select>
        </div>
        <div className="col" style={{ flex: 1 }}>
          <label htmlFor="notes">Notes (optional)</label>
          <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Description..." />
        </div>
        <div className="col">
          <label htmlFor="createdAt">Date</label>
          <input id="createdAt" type="date" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} />
        </div>
        <div className="col">
          <button type="submit" className="btn">Add</button>
        </div>
      </form>
    </div>
  );
}
