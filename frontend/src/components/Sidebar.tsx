'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/campaigns', label: 'Campaigns', icon: '🎯' },
  { href: '/directory', label: 'Directory', icon: '🌐' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>⚡</div>
        <span className={styles.logoText}>IndexFlow</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={styles.sidebarBottom}>
        <div className={styles.plan}>
          <div className={styles.planBadge}>PRO</div>
          <div className={styles.planInfo}>
            <span className={styles.planLabel}>Current Plan</span>
            <span className={styles.planName}>Professional</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
