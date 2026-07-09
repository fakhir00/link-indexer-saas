'use client';

import { useEffect, useState } from 'react';
import { api, Campaign } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import styles from './page.module.css';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const res = await api.campaigns({ limit: 50 });
      setCampaigns(res.campaigns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handlePause(id: string) {
    setActionLoading(id);
    await api.pauseCampaign(id).catch(() => null);
    await load();
    setActionLoading(null);
  }

  async function handleResume(id: string) {
    setActionLoading(id);
    await api.resumeCampaign(id).catch(() => null);
    await load();
    setActionLoading(null);
  }

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campaigns</h1>
          <p className={styles.subtitle}>{campaigns.length} total campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      {error ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h3>Could not load campaigns</h3>
          <p>{error}</p>
          <Button onClick={() => { setLoading(true); load(); }}>Retry</Button>
        </Card>
      ) : loading ? (
        <div className={styles.grid}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3>No campaigns yet</h3>
          <p>Create your first campaign to start indexing URLs at scale.</p>
          <Link href="/campaigns/new"><Button>Create Campaign</Button></Link>
        </Card>
      ) : (
        <div className={styles.grid}>
          {campaigns.map((c) => {
            const pct = c.totalUrls > 0 ? Math.round((c.completedUrls / c.totalUrls) * 100) : 0;
            return (
              <Card key={c.id} className={styles.campaignCard} padding="none">
                <Link href={`/campaigns/${c.id}`} className={styles.campaignBody}>
                  <div className={styles.campaignHeader}>
                    <h3 className={styles.campaignName}>{c.name}</h3>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Progress */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.progressPct}>{pct}%</span>
                  </div>

                  {/* Stats */}
                  <div className={styles.campaignStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statVal}>{c.totalUrls}</span>
                      <span className={styles.statKey}>Total</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={`${styles.statVal} ${styles.success}`}>{c.completedUrls}</span>
                      <span className={styles.statKey}>Completed</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={`${styles.statVal} ${styles.danger}`}>{c.failedUrls}</span>
                      <span className={styles.statKey}>Failed</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statVal}>{c.dripPerDay}</span>
                      <span className={styles.statKey}>/ day</span>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className={styles.campaignActions}>
                  {c.status === 'processing' || c.status === 'pending' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={actionLoading === c.id}
                      onClick={() => handlePause(c.id)}
                    >
                      ⏸ Pause
                    </Button>
                  ) : c.status === 'paused' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={actionLoading === c.id}
                      onClick={() => handleResume(c.id)}
                    >
                      ▶ Resume
                    </Button>
                  ) : null}
                  <span className={styles.campaignDate}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
