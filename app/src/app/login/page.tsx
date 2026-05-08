'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="card" style={{ padding: 40, width: 400, maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Welcome to IndexFlow</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Get your URLs discovered faster.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Name</label>
              <input required className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
            <input required type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
            <input required type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 10, padding: 12 }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="btn-ghost" style={{ border: 'none', padding: 0, color: 'var(--text-brand)' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
