'use client';

import { useState } from 'react';

export default function IndexStatusTab() {
  const [urls, setUrls] = useState('');

  const urlList = urls.split('\\n').map(u => u.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          🔍 URLs to Check
        </h3>
        <textarea
          className="input"
          style={{ height: 160, fontFamily: 'monospace', whiteSpace: 'pre' }}
          placeholder="Paste URLs to check index status (one per line)"
          value={urls}
          onChange={e => setUrls(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#10b981' }}>○</span> Manual Index Check Links
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Click on the Google search links below to manually verify if each URL is indexed. If results appear, your URL is indexed.
        </p>

        {urlList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            Add URLs above to generate check links
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {urlList.map((url, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {url}
                </span>
                <a
                  href={`https://www.google.com/search?q=site:${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ fontSize: 12, padding: '4px 12px', border: '1px solid var(--border-brand)', color: 'var(--text-brand)' }}
                >
                  Check Google ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
