'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Zap, BarChart3, Settings, Key, CreditCard, Users, ShieldCheck, Menu, X, ChevronRight, Activity, Globe } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

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
  userName: string;
  userCredits: number;
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
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/dashboard/billing', icon: <CreditCard size={17} />, label: 'Billing & Credits' },
      { href: '/dashboard/api-keys', icon: <Key size={17} />, label: 'API Keys' },
      { href: '/dashboard/settings', icon: <Settings size={17} />, label: 'Settings' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/dashboard/admin/users', icon: <Users size={17} />, label: 'Users' },
      { href: '/dashboard/admin/system', icon: <Activity size={17} />, label: 'System Health' },
      { href: '/dashboard/admin/security', icon: <ShieldCheck size={17} />, label: 'Security' },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
}

function SidebarContent({ pathname, userName, userCredits, closeMobile }: SidebarContentProps) {
  return (
    <>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }} onClick={closeMobile}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glow-primary)',
                fontSize: 18,
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>IndexFlow</div>
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

      <div
        style={{
          padding: '14px 14px',
          borderTop: '1px solid var(--border-subtle)',
          margin: '0 8px 8px',
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Credits</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{userCredits.toLocaleString()} credits</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min((userCredits / 6000) * 100, 100)}%` }} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Link href="/dashboard/billing" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}>
              Buy More Credits
            </button>
          </Link>
        </div>
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {userName[0]?.toUpperCase() ?? 'A'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>User</div>
        </div>
        <Link href="/dashboard/settings" style={{ color: 'var(--text-muted)' }}>
          <Settings size={15} />
        </Link>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const closeMobile = () => setMobileOpen(false);
  const userName = user?.name ?? 'Loading...';
  const userCredits = user?.credits ?? 0;

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
        <SidebarContent pathname={pathname} userName={userName} userCredits={userCredits} closeMobile={closeMobile} />
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
        <SidebarContent pathname={pathname} userName={userName} userCredits={userCredits} closeMobile={closeMobile} />
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
