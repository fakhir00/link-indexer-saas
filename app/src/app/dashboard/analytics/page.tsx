import TopBar from '@/components/TopBar';
import AnalyticsPage from '@/components/AnalyticsPage';

export default function Analytics() {
  return (
    <>
      <TopBar
        title="Analytics"
        subtitle="Discovery performance and URL processing metrics"
      />
      <AnalyticsPage />
    </>
  );
}
