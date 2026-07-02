'use client';

import { useState } from 'react';
import TopBar from '@/components/TopBar';
import PingServicesTab from './PingServicesTab';
import IndexStatusTab from './IndexStatusTab';
import GoogleApiTab from './GoogleApiTab';
import RssGeneratorTab from './RssGeneratorTab';
import SocialBookmarks from './SocialBookmarks';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'ping' | 'status' | 'google' | 'rss'>('ping');

  const tabs = [
    { id: 'ping', label: 'Ping Services', icon: '🚀' },
    { id: 'status', label: 'Check Index Status', icon: '🔍' },
    { id: 'google', label: 'Google Indexing API', icon: '🔑' },
    { id: 'rss', label: 'RSS Feed Generator', icon: '📡' },
  ] as const;

  return (
    <>
      <TopBar title="Quick Indexing Tools" subtitle="Get your backlinks discovered manually by search engines faster" />
      <div className="page-enter" style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-2)' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid var(--text-brand)' : '2px solid transparent',
                      color: activeTab === tab.id ? 'var(--text-brand)' : 'var(--text-secondary)',
                      fontWeight: activeTab === tab.id ? 700 : 600,
                      cursor: 'pointer',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: 24, minHeight: 400 }}>
                {activeTab === 'ping' && <PingServicesTab />}
                {activeTab === 'status' && <IndexStatusTab />}
                {activeTab === 'google' && <GoogleApiTab />}
                {activeTab === 'rss' && <RssGeneratorTab />}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SocialBookmarks />
            
            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#10b981' }}>💡 Indexing Tips</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> Use our automated campaigns for drip-feeding to avoid spam patterns.</li>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> Submit RSS feeds to aggregators like Feedburner.</li>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> Share your best links manually on high-authority social platforms.</li>
                <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#f59e0b' }}>!</span> Indexing is never guaranteed by Google. Quality content matters most.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
