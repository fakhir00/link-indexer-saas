'use client';

import { useEffect, useState, use } from 'react';
import { api, Campaign } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import styles from './page.module.css';

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.campaign(id);
      setCampaign(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // Poll every 5s for real-time progress
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !campaign) {
    return <div className="skeleton" style={{ height: '100vh' }} />;
  }

  if (error || !campaign) {
    return (
      <div className={styles.page}>
        <Card>
          <div style={{ color: 'var(--danger)' }}>Error loading campaign: {error}</div>
          <Link href="/campaigns" style={{ marginTop: 16, display: 'inline-block' }}>
            <Button variant="secondary">Back to Campaigns</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const urls = campaign.urls ?? [];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <Link href="/campaigns" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        ← Back to Campaigns
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {campaign.name}
            <StatusBadge status={campaign.status} />
          </h1>
          <p className={styles.subtitle}>
            Created {formatDistanceToNow(new Date(campaign.createdAt))} ago • {campaign.dripPerDay} URLs/day
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total URLs</span>
          <span className={styles.statValue}>{campaign.totalUrls}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed</span>
          <span className={`${styles.statValue} ${styles.success}`}>{campaign.completedUrls}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Failed</span>
          <span className={`${styles.statValue} ${campaign.failedUrls > 0 ? styles.danger : ''}`}>
            {campaign.failedUrls}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Processing / Queued</span>
          <span className={`${styles.statValue} ${styles.warning}`}>
            {campaign.totalUrls - campaign.completedUrls - campaign.failedUrls}
          </span>
        </div>
      </div>

      <Card className={styles.urlsSection}>
        <h2 className={styles.urlsTitle}>URL Checkpoints</h2>
        
        {urls.length === 0 ? (
          <div className={styles.emptyState}>No URLs found in this campaign.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Estimated Time</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => {
                  let estimatedTimeDisplay = '-';
                  if (url.status === 'completed' || url.status === 'failed') {
                    estimatedTimeDisplay = 'Done';
                  } else if (url.scheduledAt) {
                    const scheduled = new Date(url.scheduledAt);
                    if (scheduled > new Date()) {
                      estimatedTimeDisplay = `Scheduled for ${format(scheduled, 'MMM d, h:mm a')} (${formatDistanceToNow(scheduled)} from now)`;
                    } else {
                      estimatedTimeDisplay = 'Processing now';
                    }
                  } else {
                    estimatedTimeDisplay = 'Processing now';
                  }

                  // Determine checkpoint status
                  let checkpointStatus = url.status; // pending, queued, processing, completed, failed
                  if (url.status === 'validating' || url.validationStatus === 'pending') checkpointStatus = 'validating';
                  
                  return (
                    <tr key={url.id}>
                      <td>
                        <a href={url.link} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>
                          {url.link}
                        </a>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <StatusBadge status={checkpointStatus} />
                          {url.errorMessage && (
                            <div className={styles.errorText}>{url.errorMessage}</div>
                          )}
                        </div>
                      </td>
                      <td className={styles.timeCell}>{estimatedTimeDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
