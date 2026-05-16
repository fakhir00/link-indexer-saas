'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, Campaign } from '@/lib/api';
import { Plus, Search, Filter, Play, Pause, Trash2, Upload, AlertCircle } from 'lucide-react';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | Campaign['status'] }> = [
  { label: 'All', value: 'all' },
  { label: 'Processing', value: 'processing' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Failed', value: 'failed' },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'all' | Campaign['status']>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newCampName, setNewCampName] = useState('');
  const [newCampUrls, setNewCampUrls] = useState('');

  const loadCampaigns = useCallback(async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const handleCreate = async () => {
    const urlList = newCampUrls
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    if (!newCampName.trim()) {
      window.alert('Campaign name is required');
      return;
    }

    if (urlList.length === 0) {
      window.alert('Please add at least one URL');
      return;
    }

    setSubmitting(true);
    try {
      await api.createCampaign(newCampName.trim(), urlList);
      setShowModal(false);
      setNewCampName('');
      setNewCampUrls('');
      await loadCampaigns();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create campaign';
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: 'delete' | 'paused' | 'processing') => {
    try {
      if (action === 'delete') {
        await api.deleteCampaign(id);
      } else {
        await api.updateCampaignStatus(id, action);
      }
      await loadCampaigns();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      window.alert(message);
    }
  };

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const matchStatus = activeTab === 'all' || campaign.status === activeTab;
        const matchSearch = campaign.name.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
      }),
    [activeTab, campaigns, search],
  );

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
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
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search campaigns…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <button className="btn btn-secondary" style={{ gap: 6 }}>
          <Filter size={14} /> Filter
        </button>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ gap: 6 }}>
          <Plus size={15} /> New Campaign
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveTab(filter.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.15s',
              background: activeTab === filter.value ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: activeTab === filter.value ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
              color: activeTab === filter.value ? '#818cf8' : 'var(--text-secondary)',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {showModal && (
        <div
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-brand)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            marginBottom: 24,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create New Campaign</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Campaign Name</label>
            <input className="input" placeholder="e.g. Q2 Blog Posts Backlinks" value={newCampName} onChange={(event) => setNewCampName(event.target.value)} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>URLs (1 per line)</label>
              <button
                className="btn-ghost"
                style={{ fontSize: 12, color: 'var(--text-brand)', background: 'none', border: 'none', padding: 0, cursor: 'default' }}
                disabled
              >
                <Upload size={12} style={{ display: 'inline', marginRight: 4 }} /> Upload CSV (soon)
              </button>
            </div>
            <textarea
              className="input"
              style={{ fontFamily: 'monospace', minHeight: 180, whiteSpace: 'pre' }}
              placeholder="https://example.com/page-1&#10;https://example.com/page-2"
              value={newCampUrls}
              onChange={(event) => setNewCampUrls(event.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Campaign'}
            </button>
          </div>
        </div>
      )}

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
            {!isLoading &&
              filteredCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{campaign.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{campaign.dripPerDay} URLs/day drip</div>
                  </td>
                  <td>
                    <span className={`badge badge-${campaign.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {campaign.status}
                    </span>
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${campaign.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 32 }}>{campaign.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13 }}>{campaign.completedUrls.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/ {campaign.totalUrls.toLocaleString()}</span>
                  </td>
                  <td>
                    <span style={{ color: campaign.progress > 80 ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: 13 }}>{campaign.progress}%</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {campaign.status === 'processing' && (
                        <button onClick={() => void handleAction(campaign.id, 'paused')} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                          <Pause size={13} /> Pause
                        </button>
                      )}
                      {campaign.status === 'paused' && (
                        <button onClick={() => void handleAction(campaign.id, 'processing')} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                          <Play size={13} /> Resume
                        </button>
                      )}
                      <button onClick={() => void handleAction(campaign.id, 'delete')} className="btn btn-danger" style={{ padding: '5px 8px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {isLoading && <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading campaigns...</div>}
        {!isLoading && filteredCampaigns.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No campaigns found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
