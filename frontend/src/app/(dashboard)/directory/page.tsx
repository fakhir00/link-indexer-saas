'use client';

import { useEffect, useState } from 'react';
import { api, DirectoryUrl } from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import styles from './page.module.css';

export default function DirectoryPage() {
  const [urls, setUrls] = useState<DirectoryUrl[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.directory({ page, limit: 25 });
        if (cancelled) return;
        setUrls(res.urls ?? []);
        setTotalPages(res.totalPages ?? 1);
        setTotal(res.total ?? 0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const getDomain = (url: string) => {
    try { return new URL(url).hostname; } catch { return url; }
  };

  return (
    <div className={`${styles.page} animate-fade-in`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Public Directory</h1>
          <p className={styles.subtitle}>{total.toLocaleString()} successfully pinged URLs</p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const res = await api.enqueueOld();
                alert(res.message);
              } catch (e: any) {
                alert(e.message);
              }
            }}
          >
            Force Re-check Index
          </Button>
          <div className={styles.feedLinks}>
            <a href="/api/rss/newest" target="_blank" className={styles.feedBadge}>
              RSS Feed
            </a>
            <a href="/api/sitemap.xml" target="_blank" className={styles.feedBadge}>
              Sitemap
            </a>
          </div>
        </div>
      </div>

      {/* Directory list */}
      <Card padding="none">
        <div className={styles.tableHead}>
          <span>URL</span>
          <span>Domain</span>
          <span>Health</span>
          <span>Pinged On</span>
          <span>Index Status</span>
        </div>

        {loading ? (
          <div className={styles.loading}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonRow}`} />
            ))}
          </div>
        ) : urls.length === 0 ? (
          <div className={styles.empty}>
            <p>No indexed URLs yet. Create a campaign to get started.</p>
          </div>
        ) : (
          urls.map((u) => (
            <a
              key={u.id}
              href={u.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.row}
            >
              <span className={styles.urlLink}>{u.link}</span>
              <span className={styles.domain}>{getDomain(u.link)}</span>
              <div className={styles.healthCell}>
                {u.healthScore != null ? (
                  <>
                    <div className={styles.healthBar}>
                      <div
                        className={styles.healthFill}
                        style={{
                          width: `${u.healthScore}%`,
                          background: u.healthScore >= 80 ? 'var(--brand-success)' :
                                     u.healthScore >= 50 ? 'var(--brand-warning)' : 'var(--brand-danger)',
                        }}
                      />
                    </div>
                    <span className={styles.healthScore}>{u.healthScore}</span>
                  </>
                ) : <span className={styles.naText}>—</span>}
              </div>
              <span className={styles.date}>
                {u.discoveredAt ? new Date(u.discoveredAt).toLocaleDateString() : '—'}
              </span>
              <div className={styles.indexedCell}>
                {u.isIndexed ? (
                  <span style={{ color: 'var(--brand-success)', fontSize: '0.9rem', fontWeight: 500 }}>✅ Indexed</span>
                ) : u.lastIndexCheckAt ? (
                  <span style={{ color: 'var(--brand-warning)', fontSize: '0.9rem', fontWeight: 500 }}>⏳ Not Indexed</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Checking...</span>
                )}
              </div>
            </a>
          ))
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
