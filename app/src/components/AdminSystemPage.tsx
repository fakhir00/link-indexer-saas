'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, Database, Server, Wifi, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SystemHealth {
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
    total: number;
  };
  activeJobs: number;
  workerConcurrency: number;
  enabledIndexingStrategies: string[];
  dbConnected: boolean;
  redisConnected: boolean;
  averageProcessingTime: number;
  apiStatus: 'healthy' | 'degraded';
}

const HealthIndicator = ({ ok, label }: { ok: boolean; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {ok ? <CheckCircle size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
    <span style={{ fontSize: 13, color: ok ? '#10b981' : '#ef4444', fontWeight: 600 }}>{label}</span>
  </div>
);

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .getAdminSystem()
      .then((result) => {
        if (mounted) setHealth(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Loading system health...</div>;
  }

  if (!health) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Unable to load system health.</div>;
  }

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div
        style={{
          background: health.apiStatus === 'healthy' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${health.apiStatus === 'healthy' ? 'rgba(16,185,129,0.25)' : '#f59e0b44'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: health.apiStatus === 'healthy' ? '#10b981' : '#f59e0b',
            boxShadow: `0 0 12px ${health.apiStatus === 'healthy' ? '#10b981' : '#f59e0b'}`,
          }}
          className="animate-pulse-glow"
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            System Status: {health.apiStatus === 'healthy' ? '✓ All Systems Operational' : '⚠ Degraded Performance'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Last checked: just now · Strategies: {health.enabledIndexingStrategies.join(', ') || 'None'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Queue Size', value: health.queue.waiting.toLocaleString(), icon: <Activity size={20} />, color: '#6366f1', sub: 'URLs waiting' },
          { label: 'Worker Capacity', value: health.workerConcurrency.toString(), icon: <Server size={20} />, color: '#10b981', sub: 'Configured concurrency' },
          { label: 'Avg Processing', value: `${health.averageProcessingTime}s`, icon: <Clock size={20} />, color: '#06b6d4', sub: 'Per URL' },
          { label: 'DB Status', value: health.dbConnected ? 'Online' : 'Offline', icon: <Database size={20} />, color: health.dbConnected ? '#10b981' : '#ef4444', sub: 'Connection health' },
        ].map((item) => (
          <div key={item.label} className="stat-card" style={{ padding: '20px 22px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: `${item.color}18`,
                border: `1px solid ${item.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                marginBottom: 14,
              }}
            >
              {item.icon}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Infrastructure Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'PostgreSQL Database', ok: health.dbConnected, icon: <Database size={16} /> },
              { label: 'Redis / BullMQ Queue', ok: health.redisConnected, icon: <Activity size={16} /> },
              { label: 'REST API Layer', ok: health.apiStatus === 'healthy', icon: <Wifi size={16} /> },
              { label: 'Indexing Strategy', ok: health.enabledIndexingStrategies.length > 0, icon: <Server size={16} /> },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                </div>
                <HealthIndicator ok={item.ok} label={item.ok ? 'Online' : 'Offline'} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Queue Snapshot</h3>
          {[
            { label: 'Waiting', value: health.queue.waiting, max: Math.max(health.queue.total, 1), color: '#6366f1' },
            { label: 'In Progress', value: health.queue.active, max: Math.max(health.queue.total, 1), color: '#f59e0b' },
            { label: 'Completed', value: health.queue.completed, max: Math.max(health.queue.total, 1), color: '#10b981' },
            { label: 'Failed', value: health.queue.failed, max: Math.max(health.queue.total, 1), color: '#ef4444' },
          ].map((queueItem) => (
            <div key={queueItem.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{queueItem.label}</span>
                <span style={{ fontWeight: 700, color: queueItem.color }}>{queueItem.value.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min((queueItem.value / queueItem.max) * 100, 100)}%`, background: queueItem.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
