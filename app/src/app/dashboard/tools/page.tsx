'use client';

import { useState } from 'react';
import TopBar from '@/components/TopBar';
import { FileText, KeyRound, RadioTower, SearchCheck } from 'lucide-react';
import PingServicesTab from './PingServicesTab';
import IndexStatusTab from './IndexStatusTab';
import GoogleApiTab from './GoogleApiTab';
import RssGeneratorTab from './RssGeneratorTab';

const tabs = [
  {
    id: 'status',
    label: 'Index Verification',
    description: 'Check if URLs are indexed or at least technically indexable.',
    icon: SearchCheck,
  },
  {
    id: 'ping',
    label: 'Discovery Pings',
    description: 'Generate safe ping URLs without opening dozens of tabs automatically.',
    icon: RadioTower,
  },
  {
    id: 'rss',
    label: 'RSS Feed',
    description: 'Package backlinks into an RSS feed for discovery workflows.',
    icon: FileText,
  },
  {
    id: 'google',
    label: 'Google API',
    description: 'Advanced direct submission for eligible Google Indexing API URL types.',
    icon: KeyRound,
  },
] as const;

type ToolTab = (typeof tabs)[number]['id'];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('status');
  const activeTabDetails = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabDetails.icon;

  return (
    <>
      <TopBar title="Tools" subtitle="Verify, prepare and safely test URL discovery workflows" />
      <div className="page-enter" style={{ padding: 28 }}>
        <div className="tools-shell">
          <aside className="tools-nav card">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button key={tab.id} className={`tool-nav-item ${active ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  <span className="tool-nav-icon">
                    <Icon size={17} />
                  </span>
                  <span>
                    <strong>{tab.label}</strong>
                    <small>{tab.description}</small>
                  </span>
                </button>
              );
            })}
          </aside>

          <section className="card tool-panel">
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <ActiveIcon size={18} color="var(--text-brand)" />
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>{activeTabDetails.label}</h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{activeTabDetails.description}</p>
            </div>
            <div style={{ padding: 24, minHeight: 430 }}>
              {activeTab === 'status' && <IndexStatusTab />}
              {activeTab === 'ping' && <PingServicesTab />}
              {activeTab === 'rss' && <RssGeneratorTab />}
              {activeTab === 'google' && <GoogleApiTab />}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
