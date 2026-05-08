'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Plus, Search, Filter, Play, Pause, Trash2,
  ChevronRight, Upload, Zap, CheckCircle, Clock,
  AlertCircle, XCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Paused', value: 'Paused' },
  { label: 'Failed', value: 'Failed' },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newCampName, setNewCampName] = useState('');
  const [newCampUrls, setNewCampUrls] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const urlList = newCampUrls.split('\n').map(u => u.trim()).filter(Boolean);
      await api.createCampaign(newCampName, urlList);
      setShowModal(false);
      setNewCampName('');
      setNewCampUrls('');
      loadCampaigns();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'delete') await api.deleteCampaign(id);
      else await api.updateCampaignStatus(id, action as 'paused' | 'processing');
      loadCampaigns();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchStatus = activeTab === 'All' || c.status === activeTab.toLowerCase();
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
          onClick={() => setShowModal(true)}
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
            onClick={() => setActiveTab(f.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.15s',
              background: activeTab === f.value ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: activeTab === f.value ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
              color: activeTab === f.value ? '#818cf8' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* New Campaign Form */}
      {showModal && (
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-brand)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          marginBottom: 24,
          animation: 'fadeIn 0.3s ease',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create New Campaign</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Campaign Name</label>
            <input className="input" placeholder="e.g. Q2 Blog Posts Backlinks" value={newCampName} onChange={e => setNewCampName(e.target.value)} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>URLs (1 per line)</label>
              <button className="btn-ghost" style={{ fontSize: 12, color: 'var(--text-brand)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <Upload size={12} style={{ display: 'inline', marginRight: 4 }} /> Upload CSV
              </button>
            </div>
            <textarea className="input" style={{ fontFamily: 'monospace', minHeight: 180, whiteSpace: 'pre' }} placeholder="https://example.com/page-1&#10;https://example.com/page-2" value={newCampUrls} onChange={e => setNewCampUrls(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create Campaign</button>
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
            {filteredCampaigns.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.dripPerDay} URLs/day drip
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${c.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ minWidth: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 32 }}>
                      {c.progress}%
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 13 }}>{c.completedUrls?.toLocaleString() || 0}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/{c.totalUrls?.toLocaleString() || 0}</span>
                </td>
                <td>
                  <span style={{
                    color: c.progress > 80 ? '#10b981' : '#f59e0b',
                    fontWeight: 600, fontSize: 13,
                  }}>
                    {c.progress}%
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {c.status === 'processing' && (
                      <button onClick={() => handleAction(c.id, 'paused')} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                        <Pause size={13} /> Pause
                      </button>
                    )}
                    {c.status === 'paused' && (
                      <button onClick={() => handleAction(c.id, 'processing')} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                        <Play size={13} /> Resume
                      </button>
                    )}
                    <button onClick={() => handleAction(c.id, 'delete')} className="btn btn-danger" style={{ padding: '5px 8px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCampaigns.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No campaigns found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
