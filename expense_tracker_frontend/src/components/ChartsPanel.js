import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';

// PUBLIC_INTERFACE
export default function ChartsPanel({ chartData }) {
  /** Renders simple spending charts: by date and by category totals. */
  const byDate = chartData?.byDate ?? []; // expected [{date, total}]
  const byCategory = chartData?.byCategory ?? []; // expected [{categoryName, total}]

  return (
    <div className="row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <div className="card-header" style={{ fontWeight: 600 }}>Spending Over Time</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={byDate}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card" style={{ flex: 1, minWidth: 320 }}>
        <div className="card-header" style={{ fontWeight: 600 }}>Spending by Category</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoryName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
