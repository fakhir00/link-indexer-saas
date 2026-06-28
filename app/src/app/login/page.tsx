'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="card" style={{ padding: 40, width: 400, maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            ⚡
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Sign in to IndexFlow</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Use the account your administrator created.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
            <input required type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
            <input required type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 10, padding: 12 }} disabled={submitting}>
            {submitting ? 'Please wait…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
