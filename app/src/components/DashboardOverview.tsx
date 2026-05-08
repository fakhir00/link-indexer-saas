'use client';

import { MOCK_STATS, MOCK_CAMPAIGNS, MOCK_ANALYTICS } from '@/lib/mock-data';
import { campaignProgress, formatRelative, getCampaignStatusClass } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Globe, Zap, TrendingUp, AlertTriangle,
  ArrowUpRight, Clock, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface-3)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function DashboardOverview() {
  const stats = MOCK_STATS;
  const campaigns = MOCK_CAMPAIGNS.slice(0, 4);

  const statCards = [
    {
      label: 'Total URLs Submitted',
      value: stats.totalUrls.toLocaleString(),
      change: '+12.4%',
      changeDir: 'up',
      icon: <Globe size={20} />,
      color: '#6366f1',
    },
    {
      label: 'Active Campaigns',
      value: stats.totalCampaigns.toString(),
      change: '+2 this week',
      changeDir: 'up',
      icon: <Zap size={20} />,
      color: '#06b6d4',
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      change: '+3.2%',
      changeDir: 'up',
      icon: <TrendingUp size={20} />,
      color: '#10b981',
    },
    {
      label: 'Failure Rate',
      value: `${stats.failureRate}%`,
      change: '-1.1%',
      changeDir: 'down',
      icon: <AlertTriangle size={20} />,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="page-enter" style={{ padding: '28px' }}>

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
            Welcome back, Alex 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            You have <strong style={{ color: '#818cf8' }}>34 URLs</strong> currently processing and{' '}
            <strong style={{ color: '#10b981' }}>4,820 credits</strong> remaining this month.
          </p>
        </div>
        <Link href="/dashboard/campaigns">
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            New Campaign
          </button>
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: `${card.color}18`,
                border: `1px solid ${card.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600,
                color: card.changeDir === 'up' ? '#10b981' : '#f59e0b',
                background: card.changeDir === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                padding: '3px 8px', borderRadius: 'var(--radius-full)',
              }}>
                <ArrowUpRight size={12} style={{ transform: card.changeDir === 'down' ? 'rotate(90deg)' : undefined }} />
                {card.change}
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + campaigns grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>

        {/* Analytics chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                URL Discovery Trends
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Last 11 days
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              {[
                { color: '#6366f1', label: 'Submitted' },
                { color: '#10b981', label: 'Crawled' },
                { color: '#ef4444', label: 'Failed' },
              ].map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 260, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="crawled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="failed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="submitted" stroke="#6366f1" fill="url(#submitted)" strokeWidth={2} name="Submitted" />
                <Area type="monotone" dataKey="crawled" stroke="#10b981" fill="url(#crawled)" strokeWidth={2} name="Crawled" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#failed)" strokeWidth={2} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent campaigns */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Campaigns</h3>
            <Link href="/dashboard/campaigns" style={{
              fontSize: 12, color: 'var(--text-brand)', textDecoration: 'none', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaigns.map((c) => (
              <div key={c.id} style={{
                padding: '12px 14px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {c.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} />
                      {formatRelative(c.updatedAt)}
                    </p>
                  </div>
                  <span className={`badge ${getCampaignStatusClass(c.status)}`} style={{ marginLeft: 8, flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${campaignProgress(c)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>{c.processedUrls}/{c.totalUrls} URLs</span>
                  <span>{campaignProgress(c)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing speed + active info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Processing Speed', value: `${stats.processingSpeed} URLs/min`, icon: '⚡', color: '#6366f1' },
          { label: 'URLs This Month', value: stats.urlsThisMonth.toLocaleString(), icon: '📊', color: '#10b981' },
          { label: 'Currently Active', value: `${stats.activeNow} URLs`, icon: '🔄', color: '#06b6d4' },
        ].map((item) => (
          <div key={item.label} className="stat-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: `${item.color}15`,
              border: `1px solid ${item.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
