'use client';

import { useEffect, useState } from 'react';
import { Save, User, Bell, Lock, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [notifications, setNotifications] = useState({
    campaignComplete: true,
    urlFailed: true,
    creditsLow: true,
    weeklyReport: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.updateMe({ name, email });
      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      window.alert(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      window.alert('Please fill all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      window.alert('New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.alert('Password updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      window.alert(message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="page-enter" style={{ padding: 28, maxWidth: 760 }}>
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <User size={18} color="#818cf8" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Profile Settings</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address</label>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {(name || user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <button className="btn btn-secondary" style={{ fontSize: 13 }} disabled>
              Upload Avatar (soon)
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PNG or JPG, max 2MB</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Bell size={18} color="#06b6d4" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Notification Preferences</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(notifications).map(([key, value]) => {
            const labels: Record<string, string> = {
              campaignComplete: 'Campaign completed',
              urlFailed: 'URL permanently failed (max retries)',
              creditsLow: 'Credits below 200',
              weeklyReport: 'Weekly performance digest',
            };

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: 14 }}>{labels[key]}</span>
                <button
                  onClick={() => setNotifications((previous) => ({ ...previous, [key]: !value }))}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: value ? 'var(--brand-primary)' : 'var(--bg-surface-3)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: value ? 22 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Globe size={18} color="#10b981" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Webhook Settings</h3>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Webhook URL
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>(receives POST on URL status changes)</span>
          </label>
          <input className="input" type="url" placeholder="https://your-app.com/webhook" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Webhook delivery is coming in the next release.</p>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Lock size={18} color="#f59e0b" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Change Password</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Current Password</label>
            <input className="input" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="••••••••••••" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>New Password</label>
            <input className="input" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="••••••••••••" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm New Password</label>
            <input className="input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••••••" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => void handleChangePassword()} disabled={changingPassword}>
            {changingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => void handleSaveProfile()} style={{ padding: '11px 28px', fontSize: 14, gap: 8 }} disabled={savingProfile}>
        <Save size={15} />
        {profileSaved ? '✓ Saved!' : savingProfile ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  );
}
