'use client';

import { useState } from 'react';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data';
import { campaignProgress, getCampaignStatusClass, formatDateShort } from '@/lib/utils';
import type { Campaign, CampaignStatus } from '@/lib/types';
import {
  Plus, Search, Filter, Play, Pause, Trash2,
  ChevronRight, Upload, Zap, CheckCircle, Clock,
  AlertCircle, XCircle, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

const STATUS_FILTERS: { label: string; value: CampaignStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Processing', value: 'processing' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Failed', value: 'failed' },
];

const StatusIcon = ({ status }: { status: CampaignStatus }) => {
  const props = { size: 14 };
  switch (status) {
    case 'processing': return <Zap {...props} style={{ color: '#f59e0b' }} />;
    case 'completed': return <CheckCircle {...props} style={{ color: '#10b981' }} />;
    case 'pending': return <Clock {...props} style={{ color: '#94a3b8' }} />;
    case 'paused': return <Pause {...props} style={{ color: '#818cf8' }} />;
    case 'failed': return <XCircle {...props} style={{ color: '#ef4444' }} />;
    default: return null;
  }
};

export default function CampaignsPage() {
  const [filter, setFilter] = useState<CampaignStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', drip: '30', urls: '' });

  const filtered = MOCK_CAMPAIGNS.filter((c) => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="page-enter" style={{ padding: 28 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search campaigns…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" style={{ gap: 6 }}>
          <Filter size={14} /> Filter
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowNew(true)}
          style={{ gap: 6 }}
        >
          <Plus size={15} /> New Campaign
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.15s',
              background: filter === f.value ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: filter === f.value ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
              color: filter === f.value ? '#818cf8' : 'var(--text-secondary)',
            }}
          >
            {f.label}
            <span style={{
              marginLeft: 6, fontSize: 11,
              color: filter === f.value ? '#818cf8' : 'var(--text-muted)',
            }}>
              {f.value === 'all'
                ? MOCK_CAMPAIGNS.length
                : MOCK_CAMPAIGNS.filter(c => c.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* New Campaign Form */}
      {showNew && (
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-brand)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          marginBottom: 24,
          animation: 'fadeIn 0.3s ease',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create New Campaign</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Campaign Name
              </label>
              <input
                className="input"
                placeholder="e.g. Blog Posts — June 2024"
                value={newCampaign.name}
                onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Drip Rate (URLs/day)
              </label>
              <input
                className="input"
                type="number"
                min={1}
                max={500}
                value={newCampaign.drip}
                onChange={e => setNewCampaign(p => ({ ...p, drip: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              URLs <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(one per line, or paste CSV)</span>
            </label>
            <textarea
              className="input"
              placeholder={`https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3`}
              value={newCampaign.urls}
              onChange={e => setNewCampaign(p => ({ ...p, urls: e.target.value }))}
              style={{ minHeight: 110 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              flex: 1, height: 1, background: 'var(--border-subtle)',
            }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or upload file</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 16, borderStyle: 'dashed' }}>
            <Upload size={15} /> Upload CSV / TXT file
          </button>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => setShowNew(false)}>
              <Zap size={14} /> Launch Campaign
            </button>
          </div>
        </div>
      )}

      {/* Campaigns table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Status</th>
              <th>Progress</th>
              <th>URLs</th>
              <th>Success</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.drip_per_day} URLs/day drip
                  </div>
                </td>
                <td>
                  <span className={`badge ${getCampaignStatusClass(c.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <StatusIcon status={c.status} />
                    {c.status}
                  </span>
                </td>
                <td style={{ minWidth: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${campaignProgress(c)}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 32 }}>
                      {campaignProgress(c)}%
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 13 }}>{c.processedUrls.toLocaleString()}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/{c.totalUrls.toLocaleString()}</span>
                </td>
                <td>
                  <span style={{
                    color: c.successUrls / Math.max(c.processedUrls, 1) > 0.8 ? '#10b981' : '#f59e0b',
                    fontWeight: 600, fontSize: 13,
                  }}>
                    {c.processedUrls > 0
                      ? `${Math.round((c.successUrls / c.processedUrls) * 100)}%`
                      : '—'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {formatDateShort(c.createdAt)}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {c.status === 'processing' && (
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                        <Pause size={13} /> Pause
                      </button>
                    )}
                    {c.status === 'paused' && (
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                        <Play size={13} /> Resume
                      </button>
                    )}
                    <Link href={`/dashboard/campaigns/${c.id}`}>
                      <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}>
                        View <ChevronRight size={12} />
                      </button>
                    </Link>
                    <button className="btn btn-danger" style={{ padding: '5px 8px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No campaigns match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
