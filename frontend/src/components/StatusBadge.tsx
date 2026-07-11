interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  pinged:    { label: 'Pinged',    color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  failed:    { label: 'Failed',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
  queued:    { label: 'Queued',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  processing:{ label: 'Processing',color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   dot: '#06b6d4' },
  validating:{ label: 'Validating',color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', dot: '#8b5cf6' },
  paused:    { label: 'Paused',   color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: '#6b7280' },
  pending:   { label: 'Pending',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: '#6b7280' },
  ok:        { label: 'Healthy',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: '#10b981' },
  degraded:  { label: 'Degraded', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  up:        { label: 'Up',       color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
  down:      { label: 'Down',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  dot: '#ef4444' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status,
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.12)',
    dot: '#9ca3af',
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        background: cfg.bg,
        color: cfg.color,
        fontSize: '12px',
        fontWeight: 600,
        border: `1px solid ${cfg.color}22`,
        letterSpacing: '0.01em',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
          boxShadow: `0 0 6px ${cfg.dot}`,
        }}
      />
      {cfg.label}
    </span>
  );
}
