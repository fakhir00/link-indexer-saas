import TopBar from '@/components/TopBar';
import DashboardOverview from '@/components/DashboardOverview';

export default function DashboardPage() {
  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Welcome back, Alex · May 8, 2024"
      />
      <DashboardOverview />
    </>
  );
}
