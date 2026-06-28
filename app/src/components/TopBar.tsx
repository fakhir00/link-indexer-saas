'use client';

import { Plus } from 'lucide-react';

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
