'use client';

import { useState } from 'react';
import { MOCK_URLS } from '@/lib/mock-data';
import { getUrlStatusClass, truncateUrl, formatRelative, formatDate } from '@/lib/utils';
import { STRATEGY_INFO } from '@/lib/mock-data';
import type { UrlStatus } from '@/lib/types';
import {
  Search, Filter, RefreshCw, ExternalLink,
  Clock, AlertCircle, CheckCircle, Loader
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: UrlStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Queued', value: 'queued' },
  { label: 'Processing', value: 'processing' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Crawled', value: 'crawled' },
  { label: 'Failed', value: 'failed' },
  { label: 'Retried', value: 'retried' },
];

export default function UrlsPage() {
  const [filter, setFilter] = useState<UrlStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_URLS.filter((u) => {
    const matchStatus = filter === 'all' || u.status === filter;
    const matchSearch = u.url.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="page-enter" style={{ padding: 28 }}>

      {/* Quick stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: MOCK_URLS.length, color: '#818cf8' },
          { label: 'Crawled', value: MOCK_URLS.filter(u => u.status === 'crawled').length, color: '#10b981' },
          { label: 'Processing', value: MOCK_URLS.filter(u => u.status === 'processing').length, color: '#f59e0b' },
          { label: 'Failed', value: MOCK_URLS.filter(u => u.status === 'failed').length, color: '#ef4444' },
          { label: 'Queued', value: MOCK_URLS.filter(u => u.status === 'queued').length, color: '#94a3b8' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{s.value}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>
            <RefreshCw size={14} /> Retry All Failed
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search URLs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" style={{ gap: 6 }}>
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1px solid',
              transition: 'all 0.15s',
              background: filter === f.value ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: filter === f.value ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
              color: filter === f.value ? '#818cf8' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* URLs table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Strategy</th>
              <th>Retries</th>
              <th>Last Attempt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td style={{ maxWidth: 320 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all',
                  }}>
                    {u.url}
                  </div>
                  {u.errorMessage && (
                    <div style={{
                      fontSize: 11, color: '#ef4444', marginTop: 4,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <AlertCircle size={10} /> {u.errorMessage}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${getUrlStatusClass(u.status)}`}>
                    {u.status === 'processing' && <Loader size={10} className="animate-spin" />}
                    {u.status === 'crawled' && <CheckCircle size={10} />}
                    {u.status}
                  </span>
                </td>
                <td>
                  {u.strategy ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{STRATEGY_INFO[u.strategy as keyof typeof STRATEGY_INFO]?.icon}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {STRATEGY_INFO[u.strategy as keyof typeof STRATEGY_INFO]?.label}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: u.retryCount >= u.maxRetries ? '#ef4444' : u.retryCount > 0 ? '#f59e0b' : 'var(--text-secondary)',
                    }}>
                      {u.retryCount}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/ {u.maxRetries}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {u.lastAttemptAt ? (
                    <span title={formatDate(u.lastAttemptAt)}>
                      <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {formatRelative(u.lastAttemptAt)}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.status === 'failed' && (
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                        <RefreshCw size={11} /> Retry
                      </button>
                    )}
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ padding: '4px 8px' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No URLs match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
