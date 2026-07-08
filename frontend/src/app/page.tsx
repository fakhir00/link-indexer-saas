import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <div className={styles.navLogoIcon}>⚡</div>
            <span className={styles.navLogoText}>IndexFlow</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/directory">Directory</Link>
            <Link href="/dashboard" className={styles.navCta}>
              Open Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        {/* Background glow orbs */}
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />

        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Live Indexing Pipeline — IndexNow, Google, Bing
        </div>

        <h1 className={styles.heroTitle}>
          Get Every URL
          <br />
          <span className={styles.gradientText}>Indexed Fast</span>
        </h1>

        <p className={styles.heroSubtitle}>
          IndexFlow submits your URLs across every major search engine in parallel,
          monitors health scores in real time, and auto-retries failures — so you
          never miss a page in the index again.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/dashboard" className={styles.ctaPrimary}>
            Start Indexing Free
          </Link>
          <Link href="/directory" className={styles.ctaSecondary}>
            View Public Directory
          </Link>
        </div>

        {/* Stats Row */}
        <div className={styles.heroStats}>
          {[
            { value: '10M+', label: 'URLs Indexed' },
            { value: '99.7%', label: 'Success Rate' },
            { value: '< 24h', label: 'Avg. Index Time' },
            { value: '4', label: 'Search Engines' },
          ].map((s) => (
            <div key={s.label} className={styles.heroStat}>
              <span className={styles.heroStatValue}>{s.value}</span>
              <span className={styles.heroStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Everything you need to dominate search</h2>
            <p>A complete indexing infrastructure — from submission to monitoring.</p>
          </div>

          <div className={styles.featureGrid}>
            {[
              {
                icon: '🚀',
                title: 'Multi-Engine Submission',
                desc: 'Simultaneously submit to Google Indexing API, IndexNow (Bing/Yandex), and direct ping protocols.',
                color: '#6366f1',
              },
              {
                icon: '🩺',
                title: 'URL Health Scoring',
                desc: 'Every URL gets a 9-point health check: DNS, redirects, HTTPS, robots.txt, canonical, and more.',
                color: '#10b981',
              },
              {
                icon: '🔄',
                title: 'Smart Retry Engine',
                desc: 'Exponential backoff with error classification. Rate limits, 5xx errors, and network failures are handled automatically.',
                color: '#06b6d4',
              },
              {
                icon: '📊',
                title: 'Campaign Analytics',
                desc: 'Track completion rates, queue depth, and processing speed across all your indexing campaigns.',
                color: '#f59e0b',
              },
              {
                icon: '🔑',
                title: 'API-First Design',
                desc: 'Full REST API with API key authentication. Integrate IndexFlow into your CMS, CI/CD, or custom workflows.',
                color: '#8b5cf6',
              },
              {
                icon: '🌐',
                title: 'Public RSS Feeds',
                desc: 'Automatically generated XML sitemaps and RSS feeds for every campaign and the public directory.',
                color: '#ef4444',
              },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Simple, transparent pricing</h2>
            <p>Scale your indexing as you grow — no hidden fees.</p>
          </div>

          <div className={styles.pricingGrid}>
            {[
              {
                name: 'Starter',
                price: '$0',
                period: '/ month',
                features: ['1,000 URL submissions/mo', '1 active campaign', 'Health scoring', 'Public directory'],
                cta: 'Get Started Free',
                highlight: false,
              },
              {
                name: 'Professional',
                price: '$49',
                period: '/ month',
                features: ['50,000 URL submissions/mo', 'Unlimited campaigns', 'Priority queue', 'API access', 'RSS feeds', 'Email alerts'],
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Agency',
                price: '$199',
                period: '/ month',
                features: ['500,000 URL submissions/mo', 'Multi-tenant clients', 'Dedicated workers', 'Webhook integrations', 'SLA guarantee', 'Priority support'],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`${styles.pricingCard} ${plan.highlight ? styles.pricingHighlight : ''}`}>
                {plan.highlight && <div className={styles.pricingBadge}>Most Popular</div>}
                <div className={styles.pricingName}>{plan.name}</div>
                <div className={styles.pricingPrice}>
                  {plan.price}
                  <span>{plan.period}</span>
                </div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span className={styles.checkmark}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={plan.highlight ? styles.ctaPrimary : styles.ctaSecondarySmall}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.navLogoIcon}>⚡</div>
              <span className={styles.navLogoText}>IndexFlow</span>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/directory">Directory</Link>
              <Link href="/api/sitemap.xml">Sitemap</Link>
              <Link href="/api/rss/newest">RSS Feed</Link>
            </div>
            <p className={styles.footerCopy}>© 2025 IndexFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
