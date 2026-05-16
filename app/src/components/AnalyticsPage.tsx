'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, AnalyticsResponse } from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'var(--bg-surface-3)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: 13,
      }}
    >
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map((point) => (
        <p key={point.name} style={{ color: point.color, fontWeight: 600 }}>
          {point.name}: {Number(point.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .getAnalytics()
      .then((result) => {
        if (mounted) setAnalytics(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (!analytics) {
      return {
        totalSubmitted: 0,
        totalCrawled: 0,
        totalFailed: 0,
        successRate: 0,
      };
    }

    return {
      totalSubmitted: analytics.totalUrls,
      totalCrawled: analytics.successUrls,
      totalFailed: analytics.failedUrls,
      successRate: analytics.successRate,
    };
  }, [analytics]);

  if (loading) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Unable to load analytics data.</div>;
  }

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Submitted', value: summary.totalSubmitted.toLocaleString(), color: '#6366f1', icon: '📤' },
          { label: 'Crawl Discovered', value: summary.totalCrawled.toLocaleString(), color: '#10b981', icon: '🔍' },
          { label: 'Failed / Errored', value: summary.totalFailed.toLocaleString(), color: '#ef4444', icon: '⚠️' },
          { label: 'Overall Success', value: `${summary.successRate}%`, color: '#06b6d4', icon: '📈' },
        ].map((card) => (
          <div key={card.label} className="stat-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: card.color, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>URL Discovery Timeline</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Submitted vs crawled vs failed across the last 14 days.</p>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.trends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="sub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="crl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fld" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="submitted" stroke="#6366f1" fill="url(#sub)" strokeWidth={2} name="Submitted" />
              <Area type="monotone" dataKey="crawled" stroke="#10b981" fill="url(#crl)" strokeWidth={2} name="Crawled" />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#fld)" strokeWidth={2} name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Daily URL Volume</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>Submissions and discoveries per day</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.trends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="submitted" fill="#6366f1" radius={[4, 4, 0, 0]} name="Submitted" opacity={0.8} />
                <Bar dataKey="crawled" fill="#10b981" radius={[4, 4, 0, 0]} name="Crawled" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
