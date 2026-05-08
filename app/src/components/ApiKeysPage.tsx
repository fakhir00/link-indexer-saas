'use client';

import { useState } from 'react';
import { MOCK_API_KEYS } from '@/lib/mock-data';
import { maskApiKey, formatRelative, formatDate, generateMockApiKey } from '@/lib/utils';
import { Plus, Copy, Eye, EyeOff, Trash2, Key, Check, AlertCircle } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(MOCK_API_KEYS);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [showForm, setShowForm] = useState(false);

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const revealKey = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createKey = () => {
    if (!newLabel.trim()) return;
    const newKey = {
      id: `key_${Date.now()}`,
      userId: 'usr_01',
      key: generateMockApiKey(),
      label: newLabel,
      requestCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setKeys(prev => [...prev, newKey]);
    setNewLabel('');
    setShowForm(false);
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div className="page-enter" style={{ padding: 28 }}>

      {/* Info banner */}
      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>API Rate Limiting:</strong> Each API key is limited to 100 requests/minute.
          Keep your keys secure — they grant full access to your account.
        </div>
      </div>

      {/* Create key button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Your API Keys</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            {keys.length} key{keys.length !== 1 ? 's' : ''} — use these to authenticate REST API requests
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> Create API Key
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-brand)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          marginBottom: 24,
          animation: 'fadeIn 0.3s ease',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>New API Key</h4>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Label <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(e.g. "Production", "Zapier")</span>
              </label>
              <input
                className="input"
                placeholder="My API Key"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createKey()}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createKey} disabled={!newLabel.trim()}>
                <Key size={14} /> Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {keys.map((key) => (
          <div key={key.id} className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Key size={18} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{key.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Created {formatRelative(key.createdAt)}
                    {key.lastUsedAt && <> · Last used {formatRelative(key.lastUsedAt)}</>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${key.isActive ? 'badge-completed' : 'badge-failed'}`}>
                  {key.isActive ? 'Active' : 'Revoked'}
                </span>
                <span style={{
                  fontSize: 12, color: 'var(--text-secondary)',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  padding: '4px 10px', borderRadius: 'var(--radius-full)',
                }}>
                  {key.requestCount.toLocaleString()} requests
                </span>
              </div>
            </div>

            {/* Key display */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-surface-3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: 14,
            }}>
              <code className="code" style={{ flex: 1, color: 'var(--text-brand)', fontSize: 13 }}>
                {revealed.has(key.id) ? key.key : maskApiKey(key.key)}
              </code>
              <button
                onClick={() => revealKey(key.id)}
                className="btn btn-ghost"
                style={{ padding: '5px 8px' }}
                title={revealed.has(key.id) ? 'Hide' : 'Reveal'}
              >
                {revealed.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => copyKey(key.key, key.id)}
                className="btn btn-ghost"
                style={{ padding: '5px 8px', color: copied === key.id ? '#10b981' : undefined }}
                title="Copy"
              >
                {copied === key.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Code snippet */}
            <div style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: 14,
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                EXAMPLE REQUEST
              </p>
              <pre className="code" style={{ fontSize: 12, color: 'var(--text-secondary)', overflowX: 'auto' }}>
{`curl -X POST https://api.indexflow.io/v1/campaign \\
  -H "Authorization: Bearer ${maskApiKey(key.key)}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Campaign", "urls": ["https://example.com/page"]}'`}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-danger"
                onClick={() => revokeKey(key.id)}
                style={{ fontSize: 12, gap: 6 }}
              >
                <Trash2 size={13} /> Revoke Key
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Docs link */}
      <div style={{
        marginTop: 28, padding: 24,
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 4 }}>📚 API Documentation</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Full REST API reference, SDKs, webhooks guide and rate limit details.
          </p>
        </div>
        <button className="btn btn-secondary">View API Docs →</button>
      </div>
    </div>
  );
}
