'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Zap, BarChart3, Globe, Menu, X, ChevronRight, Wrench } from 'lucide-react';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarContentProps {
  pathname: string;
  closeMobile: () => void;
}

const navGroups: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { href: '/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
      { href: '/dashboard/campaigns', icon: <Zap size={17} />, label: 'Campaigns' },
      { href: '/dashboard/urls', icon: <Globe size={17} />, label: 'URLs' },
      { href: '/dashboard/analytics', icon: <BarChart3 size={17} />, label: 'Analytics' },
      { href: '/dashboard/tools', icon: <Wrench size={17} />, label: 'Tools' },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
}

function SidebarContent({ pathname, closeMobile }: SidebarContentProps) {
  return (
    <>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }} onClick={closeMobile}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glow-primary)',
                color: '#fff',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>IndexFlow</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>Control Panel</div>
            </div>
          </div>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                padding: '4px 12px 8px',
              }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link key={item.href} href={item.href} onClick={closeMobile} className={`nav-item ${active ? 'active' : ''}`}>
                  <span className="icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen((current) => !current)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 200,
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: 8,
          cursor: 'pointer',
          color: 'var(--text-primary)',
          display: 'none',
        }}
        className="mobile-menu-btn"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <SidebarContent pathname={pathname} closeMobile={closeMobile} />
      </aside>

      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 49,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside
        className="sidebar"
        style={{
          display: 'none',
          flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        id="mobile-sidebar"
      >
        <SidebarContent pathname={pathname} closeMobile={closeMobile} />
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          #mobile-sidebar { display: flex !important; }
          .sidebar:not(#mobile-sidebar) { display: none !important; }
        }
      `}</style>
    </>
  );
}
