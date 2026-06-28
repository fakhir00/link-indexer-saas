'use client';

import { useCallback, useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';
import { Plus, WalletCards } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  credits: number;
  campaigns: number;
  totalUrls: number;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    credits: 500,
  });

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.setAdminUserActive(id, isActive);
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      window.alert(message);
    }
  };

  const createUser = async () => {
    setCreating(true);
    try {
      await api.createAdminUser(newUser);
      setShowCreate(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', credits: 500 });
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      window.alert(message);
    } finally {
      setCreating(false);
    }
  };

  const updateCredits = async (user: AdminUser) => {
    const nextCredits = window.prompt(`Set credits for ${user.email}`, String(user.credits));
    if (nextCredits === null) return;

    const credits = Number(nextCredits);
    if (!Number.isInteger(credits) || credits < 0) {
      window.alert('Credits must be a whole number greater than or equal to 0.');
      return;
    }

    try {
      await api.setAdminUserCredits(user.id, credits);
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update credits';
      window.alert(message);
    }
  };

  return (
    <>
      <TopBar
        title="Users"
        subtitle="Provision closed-beta accounts and manage credits"
        action={{ label: 'New User', onClick: () => setShowCreate((current) => !current) }}
      />
      <div style={{ padding: 28 }}>
        {showCreate && (
          <div
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-brand)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create User</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Name</label>
                <input className="input" value={newUser.name} onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Email</label>
                <input className="input" type="email" value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Temporary Password</label>
                <input className="input" type="password" value={newUser.password} onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Starting Credits</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={newUser.credits}
                  onChange={(event) => setNewUser((current) => ({ ...current, credits: Number(event.target.value) }))}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Role</label>
                <select className="input" value={newUser.role} onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as 'user' | 'admin' }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)} disabled={creating}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => void createUser()} disabled={creating || !newUser.name || !newUser.email || !newUser.password}>
                <Plus size={14} /> {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
          }}
        >
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Campaigns</th>
                  <th>URLs Submitted</th>
                  <th>Credits</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  users.map((user) => (
                    <tr key={user.email}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--gradient-brand)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {user.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-paused">{user.role}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{user.campaigns.toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{user.totalUrls.toLocaleString()}</td>
                      <td>
                        <span style={{ color: user.credits < 100 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{user.credits.toLocaleString()}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-completed' : 'badge-failed'}`}>{user.isActive ? 'Active' : 'Disabled'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => void updateCredits(user)}>
                            <WalletCards size={12} /> Credits
                          </button>
                          {user.isActive ? (
                            <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => void toggleActive(user.id, false)}>
                              Disable
                            </button>
                          ) : (
                            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => void toggleActive(user.id, true)}>
                              Enable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {loading && <div style={{ paddingTop: 16, color: 'var(--text-muted)' }}>Loading users...</div>}
          {!loading && users.length === 0 && <div style={{ paddingTop: 16, color: 'var(--text-muted)' }}>No users found.</div>}
        </div>
      </div>
    </>
  );
}
