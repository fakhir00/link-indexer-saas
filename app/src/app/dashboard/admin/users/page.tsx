'use client';

import { useCallback, useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { api } from '@/lib/api';

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

  return (
    <>
      <TopBar title="Users" subtitle="Manage all platform users" />
      <div style={{ padding: 28 }}>
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
