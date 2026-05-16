'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, BillingOverview } from '@/lib/api';
import { Check, CreditCard, Zap, Building, Star } from 'lucide-react';

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
    if (!overview) return 0;
    if (overview.credits.monthlyAllowance <= 0) return 0;
    return Math.min(Math.round((overview.credits.usedThisMonth / overview.credits.monthlyAllowance) * 100), 100);
  }, [overview]);

  if (loading) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Loading billing details...</div>;
  }

  if (!overview) {
    return <div style={{ padding: 28, color: 'var(--text-muted)' }}>Unable to load billing details.</div>;
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
          marginBottom: 32,
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
              fontSize: 22,
              boxShadow: 'var(--glow-primary)',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{currentPlan.name} Plan</h2>
              <span className="badge badge-completed" style={{ fontSize: 11 }}>
                Active
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              ${currentPlan.price}/month · {currentPlan.monthlyCredits.toLocaleString()} credits/month
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" disabled>
            Manage Subscription (soon)
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Credits Wallet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
          {[
            { label: 'Current Balance', value: overview.credits.currentBalance.toLocaleString(), icon: '💰', color: '#818cf8' },
            { label: 'Used This Month', value: overview.credits.usedThisMonth.toLocaleString(), icon: '📤', color: '#f59e0b' },
            { label: 'Monthly Allowance', value: overview.credits.monthlyAllowance.toLocaleString(), icon: '📋', color: '#10b981' },
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
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Usage this billing cycle</span>
            <span style={{ fontWeight: 600 }}>
              {overview.credits.usedThisMonth.toLocaleString()} / {overview.credits.monthlyAllowance.toLocaleString()} ({usagePercent}%)
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Choose Your Plan</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {plans.map((plan) => {
          const isCurrent = currentPlan.id === plan.id;
          const isPopular = plan.id === 'pro';

          return (
            <div key={plan.id} className={`plan-card ${isPopular ? 'popular' : ''}`} style={{ position: 'relative' }}>
              {isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--gradient-brand)',
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--glow-primary)',
                  }}
                >
                  ⭐ Most Popular
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                {plan.id === 'starter' && <Zap size={20} color="#818cf8" />}
                {plan.id === 'pro' && <Star size={20} color="#06b6d4" />}
                {plan.id === 'agency' && <Building size={20} color="#10b981" />}
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{plan.name}</h3>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em' }}>${plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>/month</span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                    <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>
              <button className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%' }} disabled>
                {isCurrent ? '✓ Current Plan' : `Upgrade to ${plan.name} (soon)`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payment History</h3>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} disabled>
            <CreditCard size={13} /> Manage Payment Method
          </button>
        </div>
        {overview.payments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No payment records yet. Stripe checkout integration is pending configuration.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {overview.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>${(payment.amount / 100).toFixed(2)}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
