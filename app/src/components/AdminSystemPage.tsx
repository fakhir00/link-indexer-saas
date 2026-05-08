'use client';

import { MOCK_SYSTEM_HEALTH } from '@/lib/mock-data';
import { Activity, Database, Server, Wifi, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const HealthIndicator = ({ ok, label }: { ok: boolean; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {ok
      ? <CheckCircle size={16} color="#10b981" />
      : <AlertCircle size={16} color="#ef4444" />}
    <span style={{ fontSize: 13, color: ok ? '#10b981' : '#ef4444', fontWeight: 600 }}>{label}</span>
  </div>
);

export default function AdminSystemPage() {
  const h = MOCK_SYSTEM_HEALTH;

  return (
    <div className="page-enter" style={{ padding: 28 }}>

      {/* System status banner */}
      <div style={{
        background: h.apiStatus === 'healthy'
          ? 'rgba(16,185,129,0.08)'
          : h.apiStatus === 'degraded'
            ? 'rgba(245,158,11,0.08)'
            : 'rgba(239,68,68,0.08)',
        border: `1px solid ${h.apiStatus === 'healthy' ? 'rgba(16,185,129,0.25)' : '#f59e0b44'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: h.apiStatus === 'healthy' ? '#10b981' : '#f59e0b',
          boxShadow: `0 0 12px ${h.apiStatus === 'healthy' ? '#10b981' : '#f59e0b'}`,
        }} className="animate-pulse-glow" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            System Status: {h.apiStatus === 'healthy' ? '✓ All Systems Operational' : '⚠ Degraded Performance'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Last checked: just now · Avg processing: {h.averageProcessingTime}s/URL
          </div>
        </div>
      </div>

      {/* Core metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Queue Size', value: h.queueSize.toLocaleString(), icon: <Activity size={20} />, color: '#6366f1', sub: 'URLs waiting' },
          { label: 'Active Workers', value: h.workersActive.toString(), icon: <Server size={20} />, color: '#10b981', sub: 'Processing now' },
          { label: 'Avg Processing', value: `${h.averageProcessingTime}s`, icon: <Clock size={20} />, color: '#06b6d4', sub: 'Per URL' },
          { label: 'DB Connections', value: '12', icon: <Database size={20} />, color: '#f59e0b', sub: 'Pool usage' },
        ].map((item) => (
          <div key={item.label} className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: `${item.color}18`, border: `1px solid ${item.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.color, marginBottom: 14,
            }}>
              {item.icon}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Connectivity checks */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Infrastructure Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'PostgreSQL Database', ok: h.dbConnected, icon: <Database size={16} /> },
              { label: 'Redis / BullMQ Queue', ok: h.redisConnected, icon: <Activity size={16} /> },
              { label: 'REST API Layer', ok: h.apiStatus === 'healthy', icon: <Wifi size={16} /> },
              { label: 'Worker Pool', ok: h.workersActive > 0, icon: <Server size={16} /> },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                </div>
                <HealthIndicator ok={item.ok} label={item.ok ? 'Online' : 'Offline'} />
              </div>
            ))}
          </div>
        </div>

        {/* Queue snapshot */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Queue Snapshot</h3>
          {[
            { label: 'Waiting (active)', value: 487, max: 1000, color: '#6366f1' },
            { label: 'In Progress', value: 34, max: 100, color: '#f59e0b' },
            { label: 'Completed (24h)', value: 891, max: 1000, color: '#10b981' },
            { label: 'Dead Letter Queue', value: 12, max: 100, color: '#ef4444' },
          ].map((q) => (
            <div key={q.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{q.label}</span>
                <span style={{ fontWeight: 700, color: q.color }}>{q.value.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${(q.value / q.max) * 100}%`,
                  background: q.color,
                }} />
              </div>
            </div>
          ))}

          {/* Manual actions */}
          <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>
              Flush Dead Letter Queue
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>
              Retry All Failed
            </button>
            <button className="btn btn-danger" style={{ fontSize: 12, padding: '7px 14px' }}>
              Pause All Workers
            </button>
          </div>
        </div>
      </div>

      {/* Users quick table */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent User Activity</h3>
          <button className="btn btn-secondary" style={{ fontSize: 12 }}>View All Users</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>URLs Submitted</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Alex Morgan', email: 'alex@indexflow.io', plan: 'Pro', urls: 487, credits: 4820, active: true },
                { name: 'Sarah Chen', email: 'sarah@acme.co', plan: 'Agency', urls: 2100, credits: 7850, active: true },
                { name: 'Mike Torres', email: 'mike@startup.io', plan: 'Starter', urls: 89, credits: 411, active: true },
                { name: 'Emma Davis', email: 'emma@blog.net', plan: 'Starter', urls: 34, credits: 0, active: false },
              ].map((u) => (
                <tr key={u.email}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-paused">{u.plan}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.urls.toLocaleString()}</td>
                  <td>
                    <span style={{ color: u.credits < 100 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {u.credits.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.active ? 'badge-completed' : 'badge-failed'}`}>
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
                        View
                      </button>
                      {u.active && (
                        <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 10px' }}>
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
