'use client';

import { useEffect, useState } from 'react';
import { api, SystemHealth, SystemDetails, Campaign } from '@/lib/api';
import { Card, StatCard } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import Link from 'next/link';
import styles from './page.module.css';

export default function DashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [details, setDetails] = useState<SystemDetails | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [h, d, c] = await Promise.all([
          api.health(),
          api.systemDetails(),
          api.campaigns({ limit: 5 }),
        ]);
        setHealth(h);
        setDetails(d);
        setCampaigns(c.campaigns ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to connect to API');
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className={`${styles.page} animate-fade-in`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Real-time indexing pipeline overview</p>
        </div>
        <div className={styles.headerActions}>
          {health && (
            <div className={styles.healthBadge}>
              <StatusBadge status={health.status} />
              <span className={styles.healthTime}>
                Updated {new Date(health.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
          <Link href="/campaigns/new">
            <Button>+ New Campaign</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Queue Waiting"
          value={health?.queue.waiting ?? 0}
          icon="⏳"
          color="warning"
        />
        <StatCard
          label="Active Workers"
          value={details?.activeJobs ?? 0}
          icon="⚙️"
          color="cyan"
        />
        <StatCard
          label="Completed Today"
          value={health?.queue.completed ?? 0}
          icon="✅"
          color="success"
        />
        <StatCard
          label="Failed Jobs"
          value={health?.queue.failed ?? 0}
          icon="❌"
          color="danger"
        />
      </div>

      {/* System Status Row */}
      <div className={styles.statusRow}>
        <Card className={styles.serviceCard}>
          <h3 className={styles.cardTitle}>Services</h3>
          <div className={styles.serviceList}>
            <div className={styles.serviceItem}>
              <span>Database</span>
              <StatusBadge status={health?.services.database ?? 'down'} />
            </div>
            <div className={styles.serviceItem}>
              <span>Redis Queue</span>
              <StatusBadge status={health?.services.redis ?? 'down'} />
            </div>
            <div className={styles.serviceItem}>
              <span>Indexing Engine</span>
              <StatusBadge status={details?.indexingReady ? 'ok' : 'degraded'} />
            </div>
          </div>
        </Card>

        <Card className={styles.adapterCard}>
          <h3 className={styles.cardTitle}>Active Adapters</h3>
          <div className={styles.adapterList}>
            {details?.enabledIndexingStrategies && details.enabledIndexingStrategies.length > 0 ? (
              details.enabledIndexingStrategies.map((adapter: string) => (
                <div key={adapter} className={styles.adapterPill}>
                  <span className={styles.adapterDot} />
                  {adapter}
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No adapters configured</p>
            )}
            {details?.dryRunEnabled && (
              <div className={`${styles.adapterPill} ${styles.dryRunPill}`}>
                🧪 Dry Run Mode Active
              </div>
            )}
          </div>
        </Card>

        <Card className={styles.configCard}>
          <h3 className={styles.cardTitle}>Config</h3>
          <div className={styles.configList}>
            <div className={styles.configItem}>
              <span className={styles.configKey}>Concurrency</span>
              <span className={styles.configVal}>{details?.workerConcurrency ?? '—'}</span>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configKey}>Total Queued</span>
              <span className={styles.configVal}>{health?.queue.waiting ?? 0}</span>
            </div>
            <div className={styles.configItem}>
              <span className={styles.configKey}>Delayed</span>
              <span className={styles.configVal}>{health?.queue.delayed ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card padding="none">
        <div className={styles.tableHeader}>
          <h3 className={styles.cardTitle}>Recent Campaigns</h3>
          <Link href="/campaigns">
            <Button variant="ghost" size="sm">View All →</Button>
          </Link>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Campaign</span>
            <span>Status</span>
            <span>Progress</span>
            <span>URLs</span>
          </div>
          {campaigns.length === 0 ? (
            <div className={styles.emptyTable}>
              <p>No campaigns yet.</p>
              <Link href="/campaigns/new"><Button size="sm">Create your first campaign</Button></Link>
            </div>
          ) : (
            campaigns.map((c) => {
              const pct = c.totalUrls > 0 ? Math.round((c.completedUrls / c.totalUrls) * 100) : 0;
              return (
                <Link key={c.id} href={`/campaigns/${c.id}`} className={styles.tableRow}>
                  <span className={styles.campaignName}>{c.name}</span>
                  <StatusBadge status={c.status} />
                  <div className={styles.progressCell}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.progressLabel}>{pct}%</span>
                  </div>
                  <span className={styles.urlCount}>{c.completedUrls}/{c.totalUrls}</span>
                </Link>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className="skeleton" style={{ width: 160, height: 36, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 240, height: 20 }} />
        </div>
      </div>
      <div className={styles.statsGrid}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
    </div>
  );
}
