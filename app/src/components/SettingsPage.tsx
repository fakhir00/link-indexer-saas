'use client';

import { useState } from 'react';
import { Save, User, Bell, Lock, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex@indexflow.io');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.example.com/indexflow');
  const [notifications, setNotifications] = useState({
    campaignComplete: true,
    urlFailed: true,
    creditsLow: true,
    weeklyReport: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-enter" style={{ padding: 28, maxWidth: 760 }}>

      {/* Profile */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <User size={18} color="#818cf8" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Profile Settings</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Full Name
            </label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff',
          }}>A</div>
          <div>
            <button className="btn btn-secondary" style={{ fontSize: 13 }}>Upload Avatar</button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PNG or JPG, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Bell size={18} color="#06b6d4" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Notification Preferences</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(notifications).map(([key, val]) => {
            const labels: Record<string, string> = {
              campaignComplete: 'Campaign completed',
              urlFailed: 'URL permanently failed (max retries)',
              creditsLow: 'Credits below 200',
              weeklyReport: 'Weekly performance digest',
            };
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: 14 }}>{labels[key]}</span>
                <button
                  onClick={() => setNotifications(p => ({ ...p, [key]: !val }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: val ? 'var(--brand-primary)' : 'var(--bg-surface-3)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3,
                    left: val ? 22 : 3,
                    width: 18, height: 18,
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Webhook */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Globe size={18} color="#10b981" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Webhook Settings</h3>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Webhook URL
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
              (receives POST on URL status changes)
            </span>
          </label>
          <input
            className="input"
            type="url"
            placeholder="https://your-app.com/webhook"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          We'll send a POST request with the URL, status, and timestamp when a URL's status changes.
          See <a href="#" style={{ color: 'var(--text-brand)' }}>webhook docs</a> for the full payload schema.
        </p>
      </div>

      {/* Password */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Lock size={18} color="#f59e0b" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Change Password</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input className="input" type="password" placeholder="••••••••••••" />
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        style={{ padding: '11px 28px', fontSize: 14, gap: 8 }}
      >
        <Save size={15} />
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
