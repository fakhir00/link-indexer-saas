import TopBar from '@/components/TopBar';
import { ShieldCheck, AlertTriangle, Lock, Eye } from 'lucide-react';

export default function AdminSecurity() {
  return (
    <>
      <TopBar
        title="Security"
        subtitle="Monitor threats, abuse detection and access logs"
      />
      <div className="page-enter" style={{ padding: 28 }}>

        {/* Security summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Blocked Requests', value: '142', icon: '🛡️', color: '#ef4444' },
            { label: 'Rate Limited Keys', value: '7', icon: '⏱️', color: '#f59e0b' },
            { label: 'Suspicious IPs', value: '3', icon: '⚠️', color: '#f59e0b' },
            { label: 'Auth Failures (24h)', value: '28', icon: '🔐', color: '#818cf8' },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          {/* Security rules */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <ShieldCheck size={18} color="#10b981" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Active Security Rules</h3>
            </div>
            {[
              { rule: 'Rate limit: 100 req/min per API key', status: 'active' },
              { rule: 'Max 10,000 URLs per upload batch', status: 'active' },
              { rule: 'URL format validation (must be valid HTTP/S)', status: 'active' },
              { rule: 'Duplicate URL detection per campaign', status: 'active' },
              { rule: 'SQL injection prevention (parameterized queries)', status: 'active' },
              { rule: 'bcrypt password hashing (rounds: 12)', status: 'active' },
              { rule: 'JWT expiry: 15min access + 7d refresh', status: 'active' },
              { rule: 'Spam upload throttle: 3 campaigns/min', status: 'active' },
            ].map((r) => (
              <div key={r.rule} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)',
                marginBottom: 6, fontSize: 13,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{r.rule}</span>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>ON</span>
              </div>
            ))}
          </div>

          {/* Recent auth events */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Eye size={18} color="#818cf8" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Security Events</h3>
            </div>
            {[
              { event: 'API key rate limit exceeded', ip: '45.33.32.156', time: '2m ago', type: 'warn' },
              { event: 'Failed login attempt (wrong password)', ip: '192.168.1.45', time: '14m ago', type: 'error' },
              { event: 'New API key created', ip: '78.12.34.56', time: '1h ago', type: 'info' },
              { event: 'Bulk upload: 5,000 URLs', ip: '78.12.34.56', time: '2h ago', type: 'info' },
              { event: 'Failed login attempt (wrong password)', ip: '45.33.32.156', time: '3h ago', type: 'error' },
              { event: 'Suspicious IP flagged', ip: '104.21.0.1', time: '5h ago', type: 'warn' },
              { event: 'User account disabled (abuse)', ip: 'admin', time: '8h ago', type: 'error' },
            ].map((e, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '9px 12px',
                background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)',
                marginBottom: 6, fontSize: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                  background: e.type === 'error' ? '#ef4444' : e.type === 'warn' ? '#f59e0b' : '#818cf8',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{e.event}</div>
                  <div style={{ color: 'var(--text-muted)' }}>IP: {e.ip} · {e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked IPs */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lock size={18} color="#ef4444" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Blocked IPs / Users</h3>
            </div>
            <button className="btn btn-danger" style={{ fontSize: 12, padding: '6px 14px' }}>
              + Block IP
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Reason</th>
                  <th>Blocked At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ip: '45.33.32.156', reason: 'Repeated rate limit abuse', at: 'May 7, 2024' },
                  { ip: '104.21.0.1', reason: 'Spam URL submissions', at: 'May 6, 2024' },
                  { ip: '198.51.100.42', reason: 'Brute force login attempts', at: 'May 4, 2024' },
                ].map((b) => (
                  <tr key={b.ip}>
                    <td><code className="code">{b.ip}</code></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{b.reason}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{b.at}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
