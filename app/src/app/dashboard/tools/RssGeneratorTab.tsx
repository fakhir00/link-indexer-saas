'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Download, FileText } from 'lucide-react';

function parseUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'indexflow-feed';
}

export default function RssGeneratorTab() {
  const [urls, setUrls] = useState('');
  const [feedTitle, setFeedTitle] = useState('IndexFlow backlink feed');
  const [error, setError] = useState<string | null>(null);

  const urlList = useMemo(() => parseUrls(urls), [urls]);

  const generateRSS = () => {
    if (urlList.length === 0) {
      setError('Add at least one URL to generate a feed.');
      return;
    }

    const now = new Date().toUTCString();
    const safeTitle = escapeXml(feedTitle.trim() || 'IndexFlow backlink feed');
    const items = urlList
      .map((url) => {
        const safeUrl = escapeXml(url);
        return [
          '    <item>',
          `      <title>${safeUrl}</title>`,
          `      <link>${safeUrl}</link>`,
          `      <guid isPermaLink="true">${safeUrl}</guid>`,
          `      <pubDate>${now}</pubDate>`,
          '    </item>',
        ].join('\n');
      })
      .join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8" ?>',
      '<rss version="2.0">',
      '  <channel>',
      `    <title>${safeTitle}</title>`,
      '    <link>https://indexflow.local/feed</link>',
      '    <description>Generated URL discovery feed</description>',
      `    <lastBuildDate>${now}</lastBuildDate>`,
      items,
      '  </channel>',
      '</rss>',
    ].join('\n');

    const blob = new Blob([xml], { type: 'application/rss+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${slugify(feedTitle)}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="tool-input-grid">
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>URLs</label>
          <textarea
            className="input"
            style={{ height: 220, fontFamily: 'var(--font-mono)', whiteSpace: 'pre' }}
            placeholder="https://example.com/backlink-1&#10;https://example.com/backlink-2"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            One URL per line. The generated feed is downloaded locally.
          </p>
        </div>

        <div className="card" style={{ padding: 16, background: 'var(--bg-surface-2)' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245,158,11,0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <FileText size={20} />
          </div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Feed title</label>
          <input className="input" value={feedTitle} onChange={(event) => setFeedTitle(event.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <div className="metric-tile">
              <span>Items</span>
              <strong>{urlList.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Format</span>
              <strong>RSS</strong>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={generateRSS}>
            <Download size={15} />
            Download Feed
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={17} />
          <span>{error}</span>
        </div>
      )}

      <div className="alert alert-info">
        <FileText size={17} />
        <span>
          RSS feeds help create clean discovery paths. Submit the feed where appropriate, then use verification to check whether URLs become indexable or indexed.
        </span>
      </div>
    </div>
  );
}
