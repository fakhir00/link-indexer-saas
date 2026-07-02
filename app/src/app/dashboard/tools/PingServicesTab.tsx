'use client';

import { useState } from 'react';

export default function PingServicesTab() {
  const [urls, setUrls] = useState('');
  
  const pingServices = [
    { id: 'pingomatic', label: 'Ping-O-Matic', desc: 'Multi-service pinger', url: 'https://pingomatic.com/ping/?title=URL&blogurl=URL&rssurl=URL&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on&chk_newsgator=on&chk_myyahoo=on&chk_pubsubcom=on&chk_blogdigger=on&chk_weblogalot=on&chk_newsisfree=on&chk_topicexchange=on&chk_google=on&chk_tailrank=on&chk_skygrid=on&chk_collecta=on&chk_superfeedr=on' },
    { id: 'bing', label: 'Bing Webmaster', desc: 'Bing sitemap ping', url: 'https://www.bing.com/ping?sitemap=URL' },
    { id: 'yandex', label: 'Yandex Ping', desc: 'Yandex sitemap ping', url: 'https://webmaster.yandex.com/ping?sitemap=URL' },
  ];

  const [selectedServices, setSelectedServices] = useState<string[]>(pingServices.map(s => s.id));

  const handlePing = () => {
    const urlList = urls.split('\\n').map(u => u.trim()).filter(Boolean);
    if (urlList.length === 0) {
      alert('Please enter at least one URL');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Please select at least one ping service');
      return;
    }

    alert(`Warning: This will open ${urlList.length * selectedServices.length} new tabs. Please allow popups.`);

    urlList.forEach(url => {
      selectedServices.forEach(serviceId => {
        const service = pingServices.find(s => s.id === serviceId);
        if (service) {
          const pingUrl = service.url.replaceAll('URL', encodeURIComponent(url));
          window.open(pingUrl, '_blank');
        }
      });
    });
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔗 Backlink URLs
          </h3>
        </div>
        <textarea
          className="input"
          style={{ height: 280, fontFamily: 'monospace', whiteSpace: 'pre' }}
          placeholder="Paste your backlink URLs here (one per line)&#10;&#10;https://example.com/my-backlink&#10;https://another.com/article"
          value={urls}
          onChange={e => setUrls(e.target.value)}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          Note: Ping services will open in new tabs. Allow popups for best experience.
        </p>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: 16, padding: '12px', background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
          onClick={handlePing}
        >
          🚀 Generate Ping Links
        </button>
      </div>

      <div style={{ width: 280 }}>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            ⚙️ Ping Services
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pingServices.map(service => (
              <label 
                key={service.id} 
                style={{ 
                  display: 'flex', 
                  gap: 12, 
                  padding: 12, 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: selectedServices.includes(service.id) ? 'var(--bg-surface-2)' : 'transparent'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedServices.includes(service.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedServices(s => [...s, service.id]);
                    else setSelectedServices(s => s.filter(id => id !== service.id));
                  }}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {service.label} 
                    <span style={{ fontSize: 9, padding: '2px 4px', background: '#3b82f6', color: 'white', borderRadius: 4 }}>Opens Tab</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{service.desc}</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, textAlign: 'center' }}>
            {selectedServices.length} of {pingServices.length} services enabled
          </div>
        </div>
      </div>
    </div>
  );
}
