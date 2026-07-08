'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, ExternalLink, SearchCheck, XCircle } from 'lucide-react';
import { api, IndexVerificationProvider, IndexVerificationResult } from '@/lib/api';

const PROVIDERS: Array<{ label: string; value: IndexVerificationProvider; hint: string }> = [
  { label: 'Auto', value: 'auto', hint: 'Use a configured provider, otherwise run diagnostics.' },
  { label: 'Dry run', value: 'dry-run', hint: 'Validate crawlability without checking Google results.' },
  { label: 'DataForSEO', value: 'dataforseo', hint: 'Paid SERP check when credentials are configured.' },
  { label: 'Google CSE', value: 'google-cse', hint: 'Custom Search check when credentials are configured.' },
];

function parseUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function statusConfig(result: IndexVerificationResult) {
  if (result.status === 'indexed') {
    return {
      label: 'Indexed',
      className: 'badge-completed',
      icon: <CheckCircle2 size={12} />,
    };
  }

  if (result.status === 'not_indexed') {
    return {
      label: 'Not indexed',
      className: 'badge-failed',
      icon: <XCircle size={12} />,
    };
  }

  if (result.status === 'error') {
    return {
      label: 'Error',
      className: 'badge-failed',
      icon: <AlertTriangle size={12} />,
    };
  }

  return {
    label: 'Unknown',
    className: 'badge-processing',
    icon: <CircleHelp size={12} />,
  };
}

export default function IndexStatusTab() {
  const [urls, setUrls] = useState('');
  const [provider, setProvider] = useState<IndexVerificationProvider>('auto');
  const [results, setResults] = useState<IndexVerificationResult[]>([]);
  const [configuredProviders, setConfiguredProviders] = useState<{ dataforseo: boolean; googleCse: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlList = useMemo(() => parseUrls(urls), [urls]);
  const indexedCount = results.filter((result) => result.status === 'indexed').length;
  const blockedCount = results.filter((result) => result.evidence?.robotsBlocked || result.evidence?.noindex || result.evidence?.canonicalMismatch).length;

  const runVerification = async () => {
    if (urlList.length === 0) {
      setError('Add at least one URL to verify.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await api.tools.verifyIndex(urlList, provider);
      setResults(response.results);
      setConfiguredProviders(response.configuredProviders);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="tool-input-grid">
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>URLs</label>
          <textarea
            className="input"
            style={{ height: 190, fontFamily: 'var(--font-mono)', whiteSpace: 'pre' }}
            placeholder="https://example.com/page-1&#10;https://example.com/page-2"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Up to 50 URLs. Separate with new lines or commas.
          </p>
        </div>

        <div className="card" style={{ padding: 16, background: 'var(--bg-surface-2)' }}>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Provider</label>
          <select className="input" value={provider} onChange={(event) => setProvider(event.target.value as IndexVerificationProvider)}>
            {PROVIDERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
            {PROVIDERS.find((item) => item.value === provider)?.hint}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <div className="metric-tile">
              <span>URLs</span>
              <strong>{urlList.length}</strong>
            </div>
            <div className="metric-tile">
              <span>Limit</span>
              <strong>50</strong>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={() => void runVerification()} disabled={loading}>
            <SearchCheck size={15} />
            {loading ? 'Checking URLs...' : 'Verify Index Status'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={17} />
          <span>{error}</span>
        </div>
      )}

      {configuredProviders && (
        <div className="alert alert-info">
          <CircleHelp size={17} />
          <span>
            Providers configured: DataForSEO {configuredProviders.dataforseo ? 'on' : 'off'}, Google CSE{' '}
            {configuredProviders.googleCse ? 'on' : 'off'}.
          </span>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="metric-tile success">
              <span>Indexed</span>
              <strong>{indexedCount}</strong>
            </div>
            <div className="metric-tile warning">
              <span>Needs review</span>
              <strong>{results.length - indexedCount}</strong>
            </div>
            <div className="metric-tile danger">
              <span>Blocked signals</span>
              <strong>{blockedCount}</strong>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Evidence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const status = statusConfig(result);
                  const evidenceSummary = [
                    result.evidence?.httpStatus ? `HTTP ${result.evidence.httpStatus}` : null,
                    result.evidence?.isIndexable === false ? 'not indexable' : null,
                    result.evidence?.robotsBlocked ? 'robots blocked' : null,
                    result.evidence?.noindex ? 'noindex' : null,
                    result.evidence?.canonicalMismatch ? 'canonical mismatch' : null,
                    result.evidence?.itemsChecked !== undefined ? `${result.evidence.itemsChecked} SERP items` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <tr key={`${result.url}-${result.checkedAt}`}>
                      <td style={{ maxWidth: 360 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, wordBreak: 'break-all' }}>{result.url}</div>
                        {result.recommendation && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 5 }}>{result.recommendation}</div>
                        )}
                        {result.error && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 5 }}>{result.error}</div>}
                      </td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{result.provider}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{evidenceSummary || 'No match evidence'}</td>
                      <td>
                        <a
                          href={`https://www.google.com/search?q=site:${encodeURIComponent(result.url)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost"
                          style={{ padding: '5px 8px' }}
                          aria-label={`Open Google site search for ${result.url}`}
                        >
                          <ExternalLink size={13} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
