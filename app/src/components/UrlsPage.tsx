'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, UrlItem } from '@/lib/api';
import { formatDate, formatRelative } from '@/lib/utils';
import { Search, RefreshCw, ExternalLink, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

type FilterStatus = 'all' | 'queued' | 'processing' | 'completed' | 'failed';

const STATUS_FILTERS: Array<{ label: string; value: FilterStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Queued', value: 'queued' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

export default function UrlsPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingAll, setRetryingAll] = useState(false);

  const loadUrls = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getUrls({ status: filter, search, limit: 200, offset: 0 });
      setUrls(response.urls);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    void loadUrls();
  }, [loadUrls]);

  const handleRetry = async (id: string) => {
    try {
      await api.retryUrl(id);
      await loadUrls();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Retry failed';
      window.alert(message);
    }
  };

  const handleRetryAll = async () => {
    setRetryingAll(true);
    try {
      const result = await api.retryAllFailedUrls();
      if (result.retried > 0) {
        window.alert(`Queued ${result.retried} failed URL(s) for retry.`);
      }
      await loadUrls();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Retry failed';
      window.alert(message);
    } finally {
      setRetryingAll(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: urls.length,
      queued: urls.filter((url) => url.status === 'queued').length,
      processing: urls.filter((url) => url.status === 'processing').length,
      completed: urls.filter((url) => url.status === 'completed').length,
      failed: urls.filter((url) => url.status === 'failed').length,
    }),
    [urls],
  );

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: stats.total, color: '#818cf8' },
          { label: 'Completed', value: stats.completed, color: '#10b981' },
          { label: 'Processing', value: stats.processing, color: '#f59e0b' },
          { label: 'Failed', value: stats.failed, color: '#ef4444' },
          { label: 'Queued', value: stats.queued, color: '#94a3b8' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: item.color }}>{item.value}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }} onClick={() => void handleRetryAll()} disabled={retryingAll || stats.failed === 0}>
            <RefreshCw size={14} /> {retryingAll ? 'Retrying…' : 'Retry All Failed'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search URLs…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((statusFilter) => (
          <button
            key={statusFilter.value}
            onClick={() => setFilter(statusFilter.value)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.15s',
              background: filter === statusFilter.value ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: filter === statusFilter.value ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
              color: filter === statusFilter.value ? '#818cf8' : 'var(--text-secondary)',
            }}
          >
            {statusFilter.label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Campaign</th>
              <th>Retries</th>
              <th>Last Attempt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              urls.map((url) => (
                <tr key={url.id}>
                  <td style={{ maxWidth: 320 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{url.link}</div>
                    {url.errorMessage && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle size={10} /> {url.errorMessage}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${url.status}`}>
                      {url.status === 'processing' && <Loader size={10} className="animate-spin" />}
                      {url.status === 'completed' && <CheckCircle size={10} />}
                      {url.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{url.campaign?.name ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: url.retryCount >= url.maxRetries ? '#ef4444' : url.retryCount > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                        {url.retryCount}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/ {url.maxRetries}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    {url.lastAttemptAt ? (
                      <span title={formatDate(url.lastAttemptAt)}>
                        <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {formatRelative(url.lastAttemptAt)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {url.status === 'failed' && (
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => void handleRetry(url.id)}>
                          <RefreshCw size={11} /> Retry
                        </button>
                      )}
                      <a href={url.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading URLs...</div>}
        {!loading && urls.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No URLs match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
