'use client';

import { useState } from 'react';
import { PLANS, MOCK_PAYMENTS } from '@/lib/mock-data';
import { formatDateShort } from '@/lib/utils';
import { Check, CreditCard, Zap, Building, Star } from 'lucide-react';

export default function BillingPage() {
  const [currentPlan] = useState<'starter' | 'pro' | 'agency'>('pro');

  return (
    <div className="page-enter" style={{ padding: 28 }}>

      {/* Current plan banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: 'var(--glow-primary)',
          }}>⚡</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Pro Plan</h2>
              <span className="badge badge-completed" style={{ fontSize: 11 }}>Active</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              $79/month · 2,000 URL credits · Renews June 1, 2024
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">Manage Subscription</button>
          <button className="btn btn-primary">Upgrade to Agency</button>
        </div>
      </div>

      {/* Credits wallet */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Credits Wallet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
          {[
            { label: 'Current Balance', value: '4,820', icon: '💰', color: '#818cf8' },
            { label: 'Used This Month', value: '1,180', icon: '📤', color: '#f59e0b' },
            { label: 'Monthly Allowance', value: '6,000', icon: '📋', color: '#10b981' },
          ].map((item) => (
            <div key={item.label} style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.color, marginBottom: 4 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Usage this billing cycle</span>
            <span style={{ fontWeight: 600 }}>1,180 / 6,000 credits (20%)</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: '20%' }} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Credits reset on June 1, 2024. Unused credits do not roll over.
        </p>
      </div>

      {/* Plan comparison */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Choose Your Plan</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
            style={{ position: 'relative' }}
          >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              {plan.id === 'starter' && <Zap size={20} color="#818cf8" />}
              {plan.id === 'pro' && <Star size={20} color="#06b6d4" />}
              {plan.id === 'agency' && <Building size={20} color="#10b981" />}
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>{plan.name}</h3>
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em' }}>
                ${plan.price}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>/month</span>
            </div>
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
              fontSize: 13, fontWeight: 600, color: 'var(--text-brand)',
            }}>
              {plan.credits.toLocaleString()} URL credits/month
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                  <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              className={`btn ${currentPlan === plan.id ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%' }}
              disabled={currentPlan === plan.id}
            >
              {currentPlan === plan.id ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payment History</h3>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
            <CreditCard size={13} /> Manage Payment Method
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Credits</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PAYMENTS.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDateShort(p.createdAt)}</td>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>
                    {p.plan.charAt(0).toUpperCase() + p.plan.slice(1)} Plan — Monthly
                  </td>
                  <td style={{ color: 'var(--text-brand)', fontWeight: 600 }}>
                    +{p.credits.toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 14 }}>
                    ${(p.amount / 100).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'succeeded' ? 'badge-completed' : 'badge-failed'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 10px' }}>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
