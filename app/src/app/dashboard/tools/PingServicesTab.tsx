'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Copy, ExternalLink, RadioTower } from 'lucide-react';

const PING_SERVICES = [
  {
    id: 'pingomatic',
    label: 'Ping-O-Matic',
    description: 'Multi-service weblog ping endpoint.',
    template:
      'https://pingomatic.com/ping/?title=URL&blogurl=URL&rssurl=URL&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on&chk_newsgator=on&chk_myyahoo=on&chk_pubsubcom=on',
  },
  {
    id: 'bing',
    label: 'Bing Sitemap Ping',
    description: 'Sitemap discovery ping for Bing.',
    template: 'https://www.bing.com/ping?sitemap=URL',
  },
] as const;

function parseUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export default function PingServicesTab() {
  const [urls, setUrls] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(PING_SERVICES.map((service) => service.id));
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlList = useMemo(() => parseUrls(urls), [urls]);
  const pingLinks = useMemo(
    () =>
      urlList.flatMap((url) =>
        PING_SERVICES.filter((service) => selectedServices.includes(service.id)).map((service) => ({
          sourceUrl: url,
          service: service.label,
          pingUrl: service.template.replaceAll('URL', encodeURIComponent(url)),
        })),
      ),
    [selectedServices, urlList],
  );

  const copyLinks = async () => {
    if (pingLinks.length === 0) {
      setError('Add URLs and select at least one service first.');
      return;
    }

    await navigator.clipboard.writeText(pingLinks.map((link) => link.pingUrl).join('\n'));
    setCopied(true);
    setError(null);
    setTimeout(() => setCopied(false), 1800);
  };

  const openFirstBatch = () => {
    if (pingLinks.length === 0) {
      setError('Add URLs and select at least one service first.');
      return;
    }

    pingLinks.slice(0, 10).forEach((link) => window.open(link.pingUrl, '_blank', 'noopener,noreferrer'));
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="tool-input-grid">
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>URLs or sitemap URLs</label>
          <textarea
            className="input"
            style={{ height: 220, fontFamily: 'var(--font-mono)', whiteSpace: 'pre' }}
            placeholder="https://example.com/sitemap.xml&#10;https://example.com/backlink-page"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            This creates ping links for review. It does not guarantee indexing.
          </p>
        </div>

        <div className="card" style={{ padding: 16, background: 'var(--bg-surface-2)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Services</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PING_SERVICES.map((service) => (
              <label key={service.id} className="option-row">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedServices((current) => [...current, service.id]);
                    } else {
                      setSelectedServices((current) => current.filter((id) => id !== service.id));
                    }
                  }}
                />
                <span>
                  <strong>{service.label}</strong>
                  <small>{service.description}</small>
                </span>
              </label>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <div className="metric-tile">
              <span>URLs</span>
              <strong>{urlList.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Ping links</span>
              <strong>{pingLinks.length}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => void copyLinks()}>
              <Copy size={14} />
              {copied ? 'Copied' : 'Copy Links'}
            </button>
            <button className="btn btn-secondary" onClick={openFirstBatch} title="Opens up to the first 10 ping links">
              <RadioTower size={14} />
              Open 10
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={17} />
          <span>{error}</span>
        </div>
      )}

      {pingLinks.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Source URL</th>
                <th>Ping Link</th>
              </tr>
            </thead>
            <tbody>
              {pingLinks.slice(0, 100).map((link) => (
                <tr key={`${link.service}-${link.sourceUrl}`}>
                  <td style={{ fontSize: 13, fontWeight: 700 }}>{link.service}</td>
                  <td style={{ maxWidth: 300, wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{link.sourceUrl}</td>
                  <td>
                    <a href={link.pingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: '5px 8px' }}>
                      <ExternalLink size={13} />
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pingLinks.length > 100 && (
            <div style={{ padding: 14, color: 'var(--text-muted)', fontSize: 12 }}>Showing first 100 generated links.</div>
          )}
        </div>
      )}
    </div>
  );
}
