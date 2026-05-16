'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiKeyItem } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { Plus, Copy, Trash2, Key, Check, AlertCircle } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const data = await api.getApiKeys();
      setKeys(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const copyToClipboard = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const createKey = async () => {
    if (!newLabel.trim()) return;

    setCreating(true);
    try {
      const result = await api.createApiKey(newLabel.trim());
      setNewKeySecret(result.key);
      setNewLabel('');
      setShowForm(false);
      await loadKeys();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create key';
      window.alert(message);
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    try {
      await api.revokeApiKey(id);
      await loadKeys();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke key';
      window.alert(message);
    }
  };

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Security note:</strong> keep API keys private and rotate them if they are ever exposed.
        </div>
      </div>

      {newKeySecret && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <strong>New API key generated.</strong> This is the only time you can copy it.
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 10px',
              }}
            >
              <code className="code" style={{ color: '#d1fae5', flex: 1 }}>
                {newKeySecret}
              </code>
              <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => void copyToClipboard(newKeySecret, 'new-key')}>
                {copied === 'new-key' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Your API Keys</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            {keys.length} key{keys.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> Create API Key
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-brand)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            marginBottom: 24,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>New API Key</h4>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Label (for example: Production, Zapier, CI)
              </label>
              <input className="input" placeholder="My API Key" value={newLabel} onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void createKey()} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={creating}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => void createKey()} disabled={!newLabel.trim() || creating}>
                <Key size={14} /> {creating ? 'Generating…' : 'Generate Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ padding: '24px 0', color: 'var(--text-muted)' }}>Loading API keys...</div>}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {keys.map((key) => (
            <div key={key.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Key size={18} color="#818cf8" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{key.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Created {formatRelative(key.createdAt)}
                      {key.lastUsedAt ? ` · Last used ${formatRelative(key.lastUsedAt)}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${key.isActive ? 'badge-completed' : 'badge-failed'}`}>{key.isActive ? 'Active' : 'Revoked'}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {key.requestCount.toLocaleString()} requests
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: 14,
                }}
              >
                <code className="code" style={{ flex: 1, color: 'var(--text-brand)', fontSize: 13 }}>
                  {key.keyPreview}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-danger" onClick={() => void revokeKey(key.id)} style={{ fontSize: 12, gap: 6 }} disabled={!key.isActive}>
                  <Trash2 size={13} /> Revoke Key
                </button>
              </div>
            </div>
          ))}

          {keys.length === 0 && <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>No API keys yet.</div>}
        </div>
      )}
    </div>
  );
}
