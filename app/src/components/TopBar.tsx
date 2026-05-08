'use client';

import { Bell, Search, Plus } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <header style={{
      height: 64,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Title area */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '7px 12px',
        cursor: 'text',
        minWidth: 200,
      }}>
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search…</span>
        <div style={{
          marginLeft: 'auto',
          background: 'var(--bg-surface-3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 4,
          padding: '1px 6px',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          ⌘K
        </div>
      </div>

      {/* Notification bell */}
      <button style={{
        position: 'relative',
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '8px',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Bell size={16} />
        <div style={{
          position: 'absolute',
          top: 6, right: 6,
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--brand-primary)',
          border: '1px solid var(--bg-surface)',
        }} />
      </button>

      {/* CTA action */}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
          style={{ gap: 6, padding: '8px 16px', fontSize: 13 }}
        >
          <Plus size={15} />
          {action.label}
        </button>
      )}
    </header>
  );
}
