'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [urls, setUrls] = useState('');
  const [dripPerDay, setDripPerDay] = useState(50);
  const [priority, setPriority] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    if (!name.trim()) { setError('Campaign name is required'); return; }
    if (urlList.length === 0) { setError('At least one URL is required'); return; }

    setLoading(true);
    try {
      const campaign = await api.createCampaign({ name: name.trim(), urls: urlList, dripPerDay, priority });
      router.push(`/campaigns/${campaign.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  }

  const urlCount = urls.split('\n').filter(u => u.trim()).length;

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>New Campaign</h1>
          <p className={styles.subtitle}>Submit a batch of URLs for indexing</p>
        </div>
      </div>

      <div className={styles.layout}>
        <Card className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="name">Campaign Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Blog Posts Q4 2025"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="urls">
                URLs to Index
                {urlCount > 0 && <span className={styles.urlCount}>{urlCount} URLs</span>}
              </label>
              <textarea
                id="urls"
                rows={14}
                placeholder="https://example.com/page-1&#10;https://example.com/page-2&#10;..."
                value={urls}
                onChange={e => setUrls(e.target.value)}
                className={styles.urlTextarea}
              />
              <p className={styles.fieldHint}>Enter one URL per line</p>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="drip">Daily Drip Rate</label>
                <input
                  id="drip"
                  type="number"
                  min={1}
                  max={10000}
                  value={dripPerDay}
                  onChange={e => setDripPerDay(Number(e.target.value))}
                />
                <p className={styles.fieldHint}>URLs submitted per day</p>
              </div>
              <div className={styles.field}>
                <label htmlFor="priority">Priority (1–10)</label>
                <input
                  id="priority"
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                />
                <p className={styles.fieldHint}>1 = critical, 10 = low</p>
              </div>
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} disabled={!name || urlCount === 0}>
                Create Campaign ({urlCount} URLs)
              </Button>
            </div>
          </form>
        </Card>

        {/* Info sidebar */}
        <div className={styles.infoSidebar}>
          <Card>
            <h3 className={styles.infoTitle}>How it works</h3>
            <ol className={styles.infoSteps}>
              <li>
                <span className={styles.stepNum}>1</span>
                <span>URLs are validated for DNS, HTTP status, robots.txt and canonicals</span>
              </li>
              <li>
                <span className={styles.stepNum}>2</span>
                <span>Valid URLs are queued across priority levels</span>
              </li>
              <li>
                <span className={styles.stepNum}>3</span>
                <span>Submitted to Google Indexing API, IndexNow, and Bing</span>
              </li>
              <li>
                <span className={styles.stepNum}>4</span>
                <span>Failures are automatically retried with exponential backoff</span>
              </li>
            </ol>
          </Card>

          <Card>
            <h3 className={styles.infoTitle}>Supported Adapters</h3>
            <div className={styles.adapterList}>
              {['Google Indexing API', 'IndexNow (Bing/Yandex)', 'Ping Sitemap', 'Dry Run (test)'].map(a => (
                <div key={a} className={styles.adapterItem}>
                  <span className={styles.adapterDot} />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
