'use client';

import { useEffect, useState } from 'react';
import { Save, User, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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
