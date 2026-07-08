import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
}

export function Card({ children, className = '', glow, padding = 'md', onClick }: CardProps) {
  return (
    <div
      className={`${styles.card} ${glow ? styles.glow : ''} ${styles[padding]} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: string; positive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'cyan';
}

export function StatCard({ label, value, icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <Card className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={`${styles.statIcon} ${styles[`icon_${color}`]}`}>{icon}</span>
        {trend && (
          <span className={`${styles.trend} ${trend.positive ? styles.trendUp : styles.trendDown}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className={styles.statValue}>{value.toLocaleString()}</div>
      <div className={styles.statLabel}>{label}</div>
    </Card>
  );
}
