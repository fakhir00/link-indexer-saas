'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Something went wrong</h2>
      <p style={{ color: '#94a3b8', maxWidth: 400 }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          marginTop: '0.5rem',
          padding: '0.625rem 1.5rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          color: '#fff',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
