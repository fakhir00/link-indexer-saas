'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, BillingOverview } from '@/lib/api';
import { Check, WalletCards, ShieldCheck, Activity } from 'lucide-react';

interface Plan {
  id: 'starter' | 'pro' | 'agency';
  name: string;
  price: number;
  monthlyCredits: number;
  features: string[];
}

export default function BillingPage() {
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([api.getBillingOverview(), api.getBillingPlans()])
      .then(([overviewData, planData]) => {
        if (!mounted) return;
        setOverview(overviewData);
        setPlans(planData);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const usagePercent = useMemo(() => {
    if (!overview || overview.credits.monthlyAllowance <= 0) return 0;
    return Math.min(Math.round((overview.credits.usedThisMonth / overview.credits.monthlyAllowance) * 100), 100);
  }, [overview]);

  if (loading) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Loading credit details...</div>;
  }

  if (!overview) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Unable to load credit details.</div>;
  }

  const currentPlan = overview.currentPlan;

  return (
    <div className="page-enter" style={{ padding: 28 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-primary)',
              color: '#fff',
            }}
          >
            <WalletCards size={23} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{currentPlan.name} Credit Tier</h2>
              <span className="badge badge-completed" style={{ fontSize: 11 }}>
                Active
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {currentPlan.monthlyCredits.toLocaleString()} URL credits per cycle. Credits are assigned by your workspace admin.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
          Cycle ends
          <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700 }}>
            {new Date(overview.credits.cycleEnd).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Credits Wallet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
          {[
            { label: 'Current Balance', value: overview.credits.currentBalance.toLocaleString(), icon: <WalletCards size={20} />, color: '#818cf8' },
            { label: 'Used This Month', value: overview.credits.usedThisMonth.toLocaleString(), icon: <Activity size={20} />, color: '#f59e0b' },
            { label: 'Monthly Allowance', value: overview.credits.monthlyAllowance.toLocaleString(), icon: <ShieldCheck size={20} />, color: '#10b981' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
              }}
            >
              <div style={{ color: item.color, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Usage this cycle</span>
            <span style={{ fontWeight: 600 }}>
              {overview.credits.usedThisMonth.toLocaleString()} / {overview.credits.monthlyAllowance.toLocaleString()} ({usagePercent}%)
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Credit Tiers</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {plans.map((plan) => {
          const isCurrent = currentPlan.id === plan.id;

          return (
            <div key={plan.id} className={`plan-card ${isCurrent ? 'popular' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{plan.name}</h3>
                {isCurrent && <span className="badge badge-completed">Current</span>}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-brand)',
                }}
              >
                {plan.monthlyCredits.toLocaleString()} URL credits/month
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                    <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
