'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function GoogleApiTab() {
  const [urls, setUrls] = useState('');
  const [serviceAccount, setServiceAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const urlList = urls.split('\\n').map(u => u.trim()).filter(Boolean);
    if (urlList.length === 0) {
      alert('Please enter at least one URL');
      return;
    }
    if (!serviceAccount.trim()) {
      alert('Please enter your Service Account JSON');
      return;
    }

    try {
      // Validate JSON parse locally first
      JSON.parse(serviceAccount);
    } catch {
      alert('Invalid JSON format for Service Account');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await api.tools.googleIndex(serviceAccount, urlList);
      setResults(response.results);
    } catch (err: any) {
      setError(err.message || 'An error occurred while pinging Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            🔗 URLs to Index
          </h3>
          <textarea
            className="input"
            style={{ height: 200, fontFamily: 'monospace', whiteSpace: 'pre' }}
            placeholder="Paste URLs to submit (one per line)"
            value={urls}
            onChange={e => setUrls(e.target.value)}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>
              🔑 Google Service Account
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-brand)' }}>No data saved</span>
          </div>
          <textarea
            className="input"
            style={{ height: 200, fontFamily: 'monospace', fontSize: 11, background: 'var(--bg-surface-2)' }}
            placeholder='{"type": "service_account", "project_id": "...", ...}'
            value={serviceAccount}
            onChange={e => setServiceAccount(e.target.value)}
          />
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #2563eb, #3b82f6)' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting to Google...' : '🚀 Submit to Google Indexing API'}
      </button>

      {error && (
        <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {results && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Submission Results</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '8px 0' }}>URL</th>
                <th style={{ padding: '8px 0', width: 100 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.url}</td>
                  <td style={{ padding: '8px 0' }}>
                    {r.success ? (
                      <span className="badge badge-completed">Success</span>
                    ) : (
                      <span className="badge badge-failed" title={r.error}>Failed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
