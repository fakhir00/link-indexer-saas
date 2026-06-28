'use client';

import Link from 'next/link';
import { PLANS, STRATEGY_INFO } from '@/lib/mock-data';
import { Check, ArrowRight, Zap, Globe, BarChart3, Shield, RefreshCw, Key } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="hero-bg" style={{ minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,8,16,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, boxShadow: 'var(--glow-primary)',
            }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em' }}>IndexFlow</span>
          </div>

          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {['Features', 'Plans'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none',
                fontWeight: 500, transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login">
              <button className="btn btn-ghost" style={{ fontSize: 14 }}>Sign In</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-primary" style={{ fontSize: 14 }}>
                Open Dashboard <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '90px 24px 80px', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          marginBottom: 28,
          fontSize: 13, fontWeight: 600, color: '#818cf8',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="animate-pulse-glow" />
          Closed beta — admin-provisioned access
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 5vw, 72px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.08,
          marginBottom: 22,
        }}>
          Get Your URLs{' '}
          <span className="gradient-text">Discovered Faster</span>
          <br />
          by Search Engines
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: 600, margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          IndexFlow queues, validates and submits URLs through configurable discovery channels
          like ping endpoints and IndexNow, then tracks campaign progress with retries and
          operational controls for SEO teams.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/login">
            <button className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15, gap: 8 }}>
              Sign In
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* Dashboard preview */}
      <section style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 0 80px rgba(99,102,241,0.12)',
          position: 'relative',
        }}>
          {/* Fake browser bar */}
          <div style={{
            background: 'var(--bg-surface-2)',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, background: 'var(--bg-surface-3)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 12px', fontSize: 12, color: 'var(--text-muted)',
              maxWidth: 340, margin: '0 auto',
            }}>
              app.indexflow.io/dashboard
            </div>
          </div>
          {/* Preview content */}
          <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 360 }}>
            {/* Mini sidebar */}
            <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
                <span style={{ fontWeight: 800, fontSize: 13 }}>IndexFlow</span>
              </div>
              {['Dashboard', 'Campaigns', 'URLs', 'Analytics', 'Billing'].map((item, i) => (
                <div key={item} style={{
                  padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 3,
                  color: i === 0 ? '#818cf8' : 'var(--text-secondary)',
                  background: i === 0 ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: i === 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                }}>
                  {item}
                </div>
              ))}
            </div>
            {/* Mini dashboard */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Total URLs', value: '12,480', color: '#6366f1' },
                  { label: 'Campaigns', value: '24', color: '#06b6d4' },
                  { label: 'Success Rate', value: '87.3%', color: '#10b981' },
                  { label: 'Credits Left', value: '4,820', color: '#818cf8' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)',
                    padding: '12px 14px', border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Mini chart preview */}
              <div style={{
                background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)',
                padding: '14px', border: '1px solid var(--border-subtle)',
                height: 180, display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>URL Discovery Trends</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                  {[60, 80, 55, 90, 78, 95, 88, 100, 82, 92, 70].map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                      <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: '#6366f180', height: `${h}%` }} />
                      <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: '#10b98180', height: `${Math.round(h * 0.85)}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1160, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Everything you need to{' '}
            <span className="gradient-text">dominate indexing</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            A full-stack URL discovery platform built for SEOs and agencies who demand speed at scale.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              icon: <Zap size={22} />, color: '#6366f1',
              title: 'Multi-Channel Engine',
              desc: 'Run configurable provider strategies such as ping endpoints and IndexNow, with a deterministic dry-run mode for local testing.',
            },
            {
              icon: <RefreshCw size={22} />, color: '#10b981',
              title: 'Smart Retry System',
              desc: 'Failed URLs are automatically retried up to 3× with intelligent backoff. Dead-letter queue captures everything for manual review.',
            },
            {
              icon: <BarChart3 size={22} />, color: '#06b6d4',
              title: 'Real-Time Analytics',
              desc: 'Track submissions, completion rates, failures and campaign health in live dashboards backed by the API.',
            },
            {
              icon: <Globe size={22} />, color: '#f59e0b',
              title: 'Drip Feed Scheduling',
              desc: 'Set daily URL limits per campaign to stay within safe crawl budgets and avoid triggering spam filters.',
            },
            {
              icon: <Key size={22} />, color: '#818cf8',
              title: 'REST API + API Keys',
              desc: 'Generate scoped API keys and submit campaigns from external systems without sharing dashboard credentials.',
            },
            {
              icon: <Shield size={22} />, color: '#10b981',
              title: 'Admin-Managed Credits',
              desc: 'Assign credits from the admin console, monitor usage and keep campaign creation tied to available balance.',
            },
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: 28 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: `${f.color}15`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Indexing Strategies */}
      <section style={{ maxWidth: 1160, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>
            4 Indexing Strategies, 1 Platform
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Each URL goes through every channel simultaneously for the best discovery odds.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {Object.entries(STRATEGY_INFO).map(([key, s]) => (
            <div key={key} className="card" style={{ padding: 24, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-md)',
                background: `${s.color}15`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: s.color }}>{s.label}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" style={{ maxWidth: 1160, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Simple credit tiers
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
            Admins assign the tier and credits that match each workspace.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {PLANS.map((plan) => (
            <div key={plan.id} className="plan-card" style={{ position: 'relative' }}>
              {plan.isPopular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--gradient-brand)',
                  padding: '4px 14px', borderRadius: 'var(--radius-full)',
                  fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
                  boxShadow: 'var(--glow-primary)',
                }}>
                  ⭐ Most Popular
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{plan.name}</div>
              <div style={{
                padding: '8px 14px', background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)', marginBottom: 20,
                fontSize: 13, fontWeight: 600, color: 'var(--text-brand)',
              }}>
                {plan.credits.toLocaleString()} URL credits/month
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                    <Check size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/login">
                <button className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                  Sign In
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 820, margin: '0 auto 80px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Ready to accelerate your crawl?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Ask your administrator for an account, then submit campaigns and monitor every URL from one dashboard.
          </p>
          <Link href="/login">
            <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
              Sign In to Dashboard
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>IndexFlow</span>
        </div>
        <p>© 2026 IndexFlow. All rights reserved. · Not affiliated with Google LLC.</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
          {['Privacy Policy', 'Terms of Service', 'Documentation', 'Status'].map((l) => (
            <a key={l} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
