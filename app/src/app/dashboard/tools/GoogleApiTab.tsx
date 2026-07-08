'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, KeyRound, Send, XCircle } from 'lucide-react';
import { api, GoogleIndexResult } from '@/lib/api';

function parseUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export default function GoogleApiTab() {
  const [urls, setUrls] = useState('');
  const [serviceAccount, setServiceAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GoogleIndexResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const urlList = parseUrls(urls);
    if (urlList.length === 0) {
      setError('Add at least one URL.');
      return;
    }
    if (!serviceAccount.trim()) {
      setError('Paste a Google service account JSON payload.');
      return;
    }

    try {
      JSON.parse(serviceAccount);
    } catch {
      setError('Service account JSON is invalid.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await api.tools.googleIndex(serviceAccount, urlList);
      setResults(response.results);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Google submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="alert alert-warning">
        <AlertTriangle size={17} />
        <span>
          Use this only for URL types and properties eligible for the Google Indexing API. For normal pages, run campaigns and verification instead.
        </span>
      </div>

      <div className="tool-input-grid">
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>URLs</label>
          <textarea
            className="input"
            style={{ height: 220, fontFamily: 'var(--font-mono)', whiteSpace: 'pre' }}
            placeholder="https://example.com/page-1&#10;https://example.com/page-2"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>Service account JSON</label>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Used for this request only</span>
          </div>
          <textarea
            className="input"
            style={{ height: 220, fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-surface-2)' }}
            placeholder='{"type": "service_account", "project_id": "...", ...}'
            value={serviceAccount}
            onChange={(event) => setServiceAccount(event.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '13px' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <KeyRound size={15} className="animate-spin" /> : <Send size={15} />}
        {loading ? 'Submitting...' : 'Submit to Google Indexing API'}
      </button>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={17} />
          <span>{error}</span>
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
              {results.map((result) => (
                <tr key={result.url} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{result.url}</td>
                  <td style={{ padding: '8px 0' }}>
                    {result.success ? (
                      <span className="badge badge-completed">
                        <CheckCircle2 size={12} />
                        Accepted
                      </span>
                    ) : (
                      <span className="badge badge-failed" title={result.error}>
                        <XCircle size={12} />
                        Failed
                      </span>
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
