import TopBar from '@/components/TopBar';
import DashboardOverview from '@/components/DashboardOverview';

export default function DashboardPage() {
  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Campaign performance and URL processing overview"
      />
      <DashboardOverview />
    </>
  );
}
