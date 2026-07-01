'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="page-enter" style={{ padding: 28, maxWidth: 760 }}>
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <Settings size={18} color="#818cf8" />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Application Settings</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          System settings are currently managed via environment variables on the server. There are no user-configurable settings in this open deployment.
        </p>
      </div>
    </div>
  );
}
