'use client';

import { useState } from 'react';

export default function RssGeneratorTab() {
  const [urls, setUrls] = useState('');
  const [feedTitle, setFeedTitle] = useState('My Backlinks Feed');

  const generateRSS = () => {
    const urlList = urls.split('\\n').map(u => u.trim()).filter(Boolean);
    if (urlList.length === 0) {
      alert('Please enter at least one URL');
      return;
    }

    const now = new Date().toUTCString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\\n`;
    xml += `<rss version="2.0">\\n`;
    xml += `  <channel>\\n`;
    xml += `    <title>${feedTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>\\n`;
    xml += `    <link>https://example.com</link>\\n`;
    xml += `    <description>Custom generated backlinks feed</description>\\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\\n`;

    urlList.forEach(url => {
      xml += `    <item>\\n`;
      xml += `      <title>${url}</title>\\n`;
      xml += `      <link>${url}</link>\\n`;
      xml += `      <guid>${url}</guid>\\n`;
      xml += `      <pubDate>${now}</pubDate>\\n`;
      xml += `    </item>\\n`;
    });

    xml += `  </channel>\\n`;
    xml += `</rss>`;

    const blob = new Blob([xml], { type: 'application/rss+xml' });
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${feedTitle.replace(/\\s+/g, '-').toLowerCase()}-feed.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          📡 RSS Feed URLs
        </h3>
        <textarea
          className="input"
          style={{ height: 220, fontFamily: 'monospace', whiteSpace: 'pre', marginBottom: 16 }}
          placeholder="Paste URLs to include in RSS feed (one per line)"
          value={urls}
          onChange={e => setUrls(e.target.value)}
        />
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Feed Title
            </label>
            <input 
              className="input" 
              value={feedTitle}
              onChange={e => setFeedTitle(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '10px 24px', marginTop: 20, background: 'linear-gradient(to right, #f59e0b, #d97706)' }}
            onClick={generateRSS}
          >
            📥 Download XML Feed
          </button>
        </div>
      </div>
      
      <div className="card" style={{ padding: 16, background: 'var(--bg-surface-2)', border: '1px dashed var(--border-brand)' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>What do I do with this feed?</h4>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          You can submit the downloaded <code>.xml</code> file to RSS directories and ping services like Feedburner, Blogtrottr, and Feedly.
          This creates natural crawling paths for search engine bots to discover your backlinks!
        </p>
      </div>
    </div>
  );
}
