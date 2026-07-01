'use client';

import { useEffect, useState } from 'react';
import { api, AnalyticsResponse } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function DashboardOverview() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .getAnalytics()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch(() => {
        if (mounted) setData(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total URLs Submitted', value: data.totalUrls.toLocaleString(), color: '#6366f1' },
    { label: 'Active Campaigns', value: data.totalCampaigns.toLocaleString(), color: '#10b981' },
    { label: 'Avg Success Rate', value: `${data.successRate}%`, color: '#8b5cf6' },
    { label: 'Failed Extractions', value: data.failedUrls.toLocaleString(), color: '#ef4444' },
  ];

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 4,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          Welcome to IndexFlow <span style={{ animation: 'pulse 2s infinite' }}>👋</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Here is what&apos;s happening with your indexing campaigns.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>URL Discovery Trends</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Last 14 days of submissions, crawled URLs, and failures.</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="crawled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Area type="monotone" dataKey="submitted" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#submitted)" />
                <Area type="monotone" dataKey="crawled" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#crawled)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Campaigns</h3>
            <Link
              href="/dashboard/campaigns"
              className="btn-ghost"
              style={{ fontSize: 12, padding: '4px 8px', color: 'var(--text-brand)' }}
            >
              View All &rarr;
            </Link>
          </div>

          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <tbody>
                {data.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{campaign.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(campaign.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${campaign.status}`}>{campaign.status}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 12 }}>
                      {campaign.totalUrls.toLocaleString()} URLs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.recentCampaigns.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No campaigns yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
