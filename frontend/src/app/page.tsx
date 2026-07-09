import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const platformFeatures = [
  {
    label: 'Sitemap Discovery',
    title: 'Find every live sitemap path.',
    desc: 'Robots.txt directives, common sitemap paths, gzipped XML and nested sitemap indexes are scanned from one workflow.',
  },
  {
    label: 'Topic Gaps',
    title: 'Compare URLs before crawling pages.',
    desc: 'Clean sitemap slugs are converted into topic signals so teams can see competitor coverage gaps quickly.',
  },
  {
    label: 'Indexing Queue',
    title: 'Turn discovered URLs into campaigns.',
    desc: 'Push your own sitemap URLs directly into the IndexFlow validation, priority queue and retry pipeline.',
  },
  {
    label: 'Operations',
    title: 'Monitor campaigns like infrastructure.',
    desc: 'Track validation status, queued URLs, retries, failures, public directories, RSS feeds and sitemap outputs.',
  },
];

const workflow = [
  'Discover sitemap files',
  'Filter indexable content URLs',
  'Compare competitor topics',
  'Create indexing campaigns',
  'Monitor queue and retries',
];

export default function LandingPage() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>IF</span>
            <span>IndexFlow</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="#platform">Platform</Link>
            <Link href="#workflow">Workflow</Link>
            <Link href="/directory">Directory</Link>
            <Link href="/dashboard" className={styles.navCta}>
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <Image
          src="/sitemap-dashboard-mockup.jpg"
          alt="IndexFlow sitemap intelligence dashboard showing keyword gaps and sitemap analysis"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>Sitemap intelligence meets live URL indexing</p>
          <h1 className={styles.heroTitle}>IndexFlow Sitemap Intelligence</h1>
          <p className={styles.heroSubtitle}>
            Discover sitemap URLs, compare competitor topic coverage and launch priority indexing campaigns from one institutional SEO operations console.
          </p>
          <div className={styles.heroActions}>
            <Link href="/sitemap-intelligence" className={styles.primaryAction}>
              Analyze Sitemaps
            </Link>
            <Link href="/campaigns/new" className={styles.secondaryAction}>
              Create Campaign
            </Link>
          </div>
          <div className={styles.heroStats} aria-label="Platform highlights">
            <span><strong>Nested XML</strong> sitemap support</span>
            <span><strong>5</strong> competitors per scan</span>
            <span><strong>1,000</strong> URLs per analysis</span>
          </div>
        </div>
      </section>

      <section id="platform" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Platform</p>
            <h2>One console for discovery, intelligence and indexing.</h2>
            <p>
              The sitemaptool workflow is now integrated with IndexFlow’s campaign engine, so research can become queueable indexing work without exporting spreadsheets.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {platformFeatures.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <span>{feature.label}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className={styles.workflowSection}>
        <div className={styles.container}>
          <div className={styles.workflowLayout}>
            <div>
              <p className={styles.sectionKicker}>Workflow</p>
              <h2>From domain to indexing campaign in one pass.</h2>
              <p>
                IndexFlow checks sitemap sources, filters URLs, scores competitor topic gaps and hands your own URLs to the same validation queue used by campaign imports.
              </p>
              <Link href="/sitemap-intelligence" className={styles.inlineAction}>
                Open Sitemap Intelligence
              </Link>
            </div>
            <ol className={styles.workflowList}>
              {workflow.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Scale</p>
            <h2>Built for serious SEO operations.</h2>
            <p>Campaigns, queues, public feeds and sitemap intelligence are packaged for teams managing large URL portfolios.</p>
          </div>

          <div className={styles.planGrid}>
            {[
              { name: 'Starter', price: '$0', detail: 'Sitemap scans, health checks and small campaigns.' },
              { name: 'Professional', price: '$49', detail: 'Priority queues, sitemap gap analysis and API access.' },
              { name: 'Agency', price: '$199', detail: 'Large campaigns, client workflows, audit trails and webhooks.' },
            ].map((plan) => (
              <article key={plan.name} className={styles.planCard}>
                <h3>{plan.name}</h3>
                <strong>{plan.price}<span>/mo</span></strong>
                <p>{plan.detail}</p>
                <Link href="/dashboard">Open Dashboard</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>IF</span>
            <span>IndexFlow</span>
          </Link>
          <div className={styles.footerLinks}>
            <Link href="/sitemap-intelligence">Sitemap Intelligence</Link>
            <Link href="/campaigns">Campaigns</Link>
            <Link href="/directory">Directory</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
