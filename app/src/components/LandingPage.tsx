'use client';

import Link from 'next/link';
import { ArrowRight, Clock, RadioTower, RefreshCw, SearchCheck, ShieldCheck, Zap } from 'lucide-react';

const workflow = [
  {
    title: 'Create campaigns',
    description: 'Paste URLs, import CSV lists and set a drip-feed pace for beta testing.',
    icon: Zap,
    color: '#5eead4',
  },
  {
    title: 'Validate URLs',
    description: 'Catch broken, blocked and noindex pages before wasting indexing attempts.',
    icon: ShieldCheck,
    color: '#22c55e',
  },
  {
    title: 'Submit safely',
    description: 'Process URLs through queues, retries and controlled discovery channels.',
    icon: RadioTower,
    color: '#38bdf8',
  },
  {
    title: 'Verify status',
    description: 'Run dry-run diagnostics now, then provider-backed index checks when keys are configured.',
    icon: SearchCheck,
    color: '#f59e0b',
  },
];

const metrics = [
  { label: 'Ready URLs', value: '8,420', color: '#5eead4' },
  { label: 'Active Campaigns', value: '18', color: '#38bdf8' },
  { label: 'Validation Pass', value: '91%', color: '#22c55e' },
  { label: 'Needs Review', value: '312', color: '#f59e0b' },
];

export default function LandingPage() {
  return (
    <div className="hero-bg" style={{ minHeight: '100vh' }}>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,9,10,0.86)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'var(--glow-primary)',
              }}
            >
              <Zap size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17 }}>IndexFlow</span>
          </div>

          <Link href="/dashboard">
            <button className="btn btn-primary" style={{ fontSize: 14 }}>
              Open Dashboard <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      <main>
        <section style={{ maxWidth: 1160, margin: '0 auto', padding: '88px 24px 64px' }}>
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(20,184,166,0.1)',
                border: '1px solid rgba(20,184,166,0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                marginBottom: 24,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-brand)',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              Beta test build
            </div>

            <h1 style={{ fontSize: 'clamp(44px, 6vw, 78px)', fontWeight: 900, lineHeight: 1.02, marginBottom: 22 }}>
              IndexFlow
            </h1>
            <p style={{ fontSize: 'clamp(17px, 2vw, 21px)', color: 'var(--text-secondary)', maxWidth: 660, lineHeight: 1.65, marginBottom: 34 }}>
              A focused URL indexing operations console for testing campaign creation, drip feeding, URL validation, queue processing and index verification.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard">
                <button className="btn btn-primary" style={{ padding: '13px 24px', fontSize: 15 }}>
                  Start Testing <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/dashboard/tools">
                <button className="btn btn-secondary" style={{ padding: '13px 20px', fontSize: 15 }}>
                  Verify URLs <SearchCheck size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: '0 auto 72px', padding: '0 24px' }}>
          <div
            className="card"
            style={{
              overflow: 'hidden',
              borderColor: 'var(--border-default)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
            }}
          >
            <div
              style={{
                background: 'var(--bg-surface-2)',
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {['#ef4444', '#f59e0b', '#22c55e'].map((color) => (
                <span key={color} style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              ))}
              <div
                style={{
                  flex: 1,
                  background: 'var(--bg-surface-3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 12px',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  maxWidth: 340,
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                /dashboard/campaigns
              </div>
            </div>

            <div className="landing-preview">
              <aside style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--gradient-brand)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <Zap size={14} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>IndexFlow</span>
                </div>
                {['Dashboard', 'Campaigns', 'URLs', 'Analytics', 'Tools'].map((item, index) => (
                  <div
                    key={item}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                      marginBottom: 3,
                      color: index === 1 ? 'var(--text-brand)' : 'var(--text-secondary)',
                      background: index === 1 ? 'rgba(20,184,166,0.12)' : 'transparent',
                      border: index === 1 ? '1px solid rgba(20,184,166,0.22)' : '1px solid transparent',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </aside>

              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      style={{
                        background: 'var(--bg-surface-2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 800, color: metric.color, marginBottom: 3 }}>{metric.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{metric.label}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    border: '1px solid var(--border-subtle)',
                    height: 180,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Campaign throughput</span>
                    <span className="badge badge-processing">
                      <Clock size={11} />
                      Drip feed active
                    </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                    {[55, 72, 48, 86, 76, 92, 84, 96, 70, 88, 64].map((height, index) => (
                      <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                        <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: '#38bdf880', height: `${height}%` }} />
                        <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: '#22c55e80', height: `${Math.round(height * 0.78)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={{ maxWidth: 1160, margin: '0 auto 80px', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {workflow.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card" style={{ padding: 24 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-md)',
                      background: `${feature.color}14`,
                      border: `1px solid ${feature.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{feature.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ maxWidth: 840, margin: '0 auto 80px', padding: '0 24px' }}>
          <div
            className="card"
            style={{
              padding: '34px 36px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 20,
              alignItems: 'center',
              borderColor: 'rgba(20,184,166,0.22)',
            }}
          >
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Ready for beta testing?</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Start with a small campaign, inspect URL outcomes, then test verification and retry behavior.
              </p>
            </div>
            <Link href="/dashboard">
              <button className="btn btn-primary">
                Open Dashboard <RefreshCw size={15} />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '28px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <Zap size={15} color="var(--text-brand)" />
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>IndexFlow</span>
        </div>
        <p>Beta build for URL discovery testing. Not affiliated with Google LLC.</p>
      </footer>
    </div>
  );
}
