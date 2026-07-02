'use client';

export default function SocialBookmarks() {
  const bookmarks = [
    { name: 'Reddit', icon: '🔗', getUrl: () => 'https://www.reddit.com/submit' },
    { name: 'Mix (Stumble)', icon: '🌀', getUrl: () => 'https://mix.com' },
    { name: 'Diigo', icon: '📌', getUrl: () => 'https://www.diigo.com' },
    { name: 'Pocket', icon: '📥', getUrl: () => 'https://getpocket.com/edit' },
    { name: 'Flipboard', icon: '📰', getUrl: () => 'https://flipboard.com' },
    { name: 'Scoop.it', icon: '🍦', getUrl: () => 'https://www.scoop.it' },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        🌐 Social Bookmarks
      </h3>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Manually submit your links to these high-authority platforms for additional indexing signals.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {bookmarks.map((b) => (
          <a
            key={b.name}
            href={b.getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              fontSize: 12, 
              padding: '8px 12px',
              border: '1px solid var(--border-subtle)',
              justifyContent: 'flex-start'
            }}
          >
            <span>{b.icon}</span> {b.name}
          </a>
        ))}
      </div>
    </div>
  );
}
