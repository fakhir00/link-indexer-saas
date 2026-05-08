'use client';

import { MOCK_ANALYTICS } from '@/lib/mock-data';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface-3)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const PIE_DATA = [
  { name: 'Ping', value: 38, color: '#06b6d4' },
  { name: 'Sitemap', value: 27, color: '#10b981' },
  { name: 'API Submit', value: 22, color: '#6366f1' },
  { name: 'Buffer', value: 13, color: '#f59e0b' },
];

export default function AnalyticsPage() {
  const totalSubmitted = MOCK_ANALYTICS.reduce((sum, d) => sum + d.submitted, 0);
  const totalCrawled = MOCK_ANALYTICS.reduce((sum, d) => sum + d.crawled, 0);
  const totalFailed = MOCK_ANALYTICS.reduce((sum, d) => sum + d.failed, 0);
  const successRate = Math.round((totalCrawled / totalSubmitted) * 100);

  return (
    <div className="page-enter" style={{ padding: 28 }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Submitted', value: totalSubmitted.toLocaleString(), color: '#6366f1', icon: '📤' },
          { label: 'Crawl Discovered', value: totalCrawled.toLocaleString(), color: '#10b981', icon: '🔍' },
          { label: 'Failed / Errored', value: totalFailed.toLocaleString(), color: '#ef4444', icon: '⚠️' },
          { label: 'Overall Success', value: `${successRate}%`, color: '#06b6d4', icon: '📈' },
        ].map((card) => (
          <div key={card.label} className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: card.color, marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Main area chart */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>URL Discovery Timeline</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              Submitted vs. Crawl-discovered vs. Failed — last 11 days
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['7d', '30d', '90d'].map((r) => (
              <button key={r} style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                background: r === '7d' ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: '1px solid', borderColor: r === '7d' ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
                color: r === '7d' ? '#818cf8' : 'var(--text-secondary)', cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_ANALYTICS} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                {[
                  { id: 'sub', color: '#6366f1' },
                  { id: 'crl', color: '#10b981' },
                  { id: 'fld', color: '#ef4444' },
                ].map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="submitted" stroke="#6366f1" fill="url(#sub)" strokeWidth={2} name="Submitted" />
              <Area type="monotone" dataKey="crawled" stroke="#10b981" fill="url(#crl)" strokeWidth={2} name="Crawled" />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#fld)" strokeWidth={2} name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Bar chart - daily volume */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Daily URL Volume</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>
            Submissions and discoveries per day
          </p>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ANALYTICS} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="submitted" fill="#6366f1" radius={[4,4,0,0]} name="Submitted" opacity={0.8} />
                <Bar dataKey="crawled" fill="#10b981" radius={[4,4,0,0]} name="Crawled" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart - strategies */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Strategy Distribution</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Which indexing strategies were used
          </p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {PIE_DATA.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
