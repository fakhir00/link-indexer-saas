'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, SitemapAnalyzeResponse } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';

function splitDomains(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hostLabel(value: string) {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./i, '');
  } catch {
    return value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }
}

export default function SitemapIntelligencePage() {
  const router = useRouter();
  const [ownDomain, setOwnDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [maxUrls, setMaxUrls] = useState(300);
  const [contentOnly, setContentOnly] = useState(false);
  const [analysis, setAnalysis] = useState<SitemapAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [error, setError] = useState('');

  const competitorDomains = useMemo(() => splitDomains(competitors).slice(0, 5), [competitors]);
  const campaignUrlCount = analysis?.own.indexableUrls.length ?? 0;

  async function handleAnalyze(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.sitemapAnalyze({
        ownDomain: ownDomain.trim(),
        competitorDomains,
        maxUrls,
        contentOnly,
      });
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sitemap analysis failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCampaign() {
    if (!analysis || analysis.own.indexableUrls.length === 0) return;

    setError('');
    setCampaignLoading(true);
    try {
      const campaign = await api.createCampaign({
        name: `Sitemap indexing - ${analysis.own.domain}`,
        urls: analysis.own.indexableUrls,
        dripPerDay: Math.min(1000, Math.max(50, analysis.own.indexableUrls.length)),
        priority: 3,
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Campaign creation failed');
    } finally {
      setCampaignLoading(false);
    }
  }

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Sitemap Intelligence</p>
          <h1 className={styles.title}>Discover, compare and queue URLs from sitemaps.</h1>
          <p className={styles.subtitle}>
            Pull live sitemap URLs, isolate content pages, compare competitor topics and turn your own sitemap URLs into an indexing campaign.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <Card className={styles.formCard}>
          <form className={styles.form} onSubmit={handleAnalyze}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="ownDomain">Your domain</label>
              <input
                id="ownDomain"
                placeholder="example.com"
                value={ownDomain}
                onChange={(event) => setOwnDomain(event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="competitors">Competitor domains</label>
              <textarea
                id="competitors"
                rows={5}
                placeholder="competitor-one.com&#10;competitor-two.com"
                value={competitors}
                onChange={(event) => setCompetitors(event.target.value)}
              />
              <p className={styles.hint}>{competitorDomains.length}/5 competitors selected</p>
            </div>

            <div className={styles.controlGrid}>
              <div className={styles.field}>
                <label htmlFor="maxUrls">URL cap</label>
                <input
                  id="maxUrls"
                  type="number"
                  min={10}
                  max={1000}
                  step={10}
                  value={maxUrls}
                  onChange={(event) => setMaxUrls(Number(event.target.value))}
                />
              </div>

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={contentOnly}
                  onChange={(event) => setContentOnly(event.target.checked)}
                />
                <span>Queue content URLs only</span>
              </label>
            </div>

            <Button type="submit" loading={loading} disabled={!ownDomain.trim()}>
              Analyze Sitemaps
            </Button>
          </form>
        </Card>

        <div className={styles.summaryRail}>
          <Card>
            <p className={styles.metricLabel}>Ready for indexing</p>
            <strong className={styles.metricValue}>{campaignUrlCount.toLocaleString()}</strong>
            <span className={styles.metricHint}>URLs from your sitemap selection</span>
          </Card>
          <Card>
            <p className={styles.metricLabel}>Keyword gaps</p>
            <strong className={styles.metricValue}>{(analysis?.gaps.length ?? 0).toLocaleString()}</strong>
            <span className={styles.metricHint}>Topics competitors cover that your sitemap does not</span>
          </Card>
          <Button
            type="button"
            variant="secondary"
            loading={campaignLoading}
            disabled={!analysis || campaignUrlCount === 0}
            onClick={handleCreateCampaign}
          >
            Create Indexing Campaign
          </Button>
        </div>
      </div>

      {analysis && (
        <div className={styles.results}>
          <div className={styles.metricsGrid}>
            {[
              { label: 'Own URLs', value: analysis.totals.ownUrls },
              { label: 'Own content URLs', value: analysis.totals.ownContentUrls },
              { label: 'Competitor URLs', value: analysis.totals.competitorUrls },
              { label: 'Competitor topics', value: analysis.totals.competitorTopics },
            ].map((metric) => (
              <Card key={metric.label}>
                <p className={styles.metricLabel}>{metric.label}</p>
                <strong className={styles.metricValue}>{metric.value.toLocaleString()}</strong>
              </Card>
            ))}
          </div>

          <Card>
            <div className={styles.sectionHead}>
              <div>
                <h2>Topic Gap Board</h2>
                <p>{analysis.gaps.length} prioritized opportunities from {analysis.competitors.length} competitor sitemap scans.</p>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Competitors</th>
                    <th>Sample URL</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.gaps.slice(0, 20).map((gap) => (
                    <tr key={gap.topic}>
                      <td>{gap.topic}</td>
                      <td>{gap.score}</td>
                      <td>{gap.competitorDomains.join(', ')}</td>
                      <td>
                        {gap.sampleUrls[0] ? (
                          <a href={gap.sampleUrls[0]} target="_blank" rel="noopener noreferrer">
                            {hostLabel(gap.sampleUrls[0])}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className={styles.detailGrid}>
            <Card>
              <div className={styles.sectionHead}>
                <div>
                  <h2>Your Sitemap URLs</h2>
                  <p>{analysis.own.sitemapUrls.length} sitemap files discovered for {analysis.own.domain}.</p>
                </div>
              </div>
              <div className={styles.urlList}>
                {analysis.own.indexableUrls.slice(0, 12).map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </a>
                ))}
              </div>
            </Card>

            <Card>
              <div className={styles.sectionHead}>
                <div>
                  <h2>Discovery Sources</h2>
                  <p>Robots.txt, common sitemap paths and nested indexes checked live.</p>
                </div>
              </div>
              <div className={styles.sourceList}>
                {analysis.own.sources.slice(0, 12).map((source) => (
                  <div key={`${source.url}-${source.type}`} className={styles.sourceItem}>
                    <span className={`${styles.sourceDot} ${styles[source.status]}`} />
                    <span>{source.type}</span>
                    <strong>{source.urlsFound}</strong>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {hostLabel(source.url)}
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
