import TopBar from '@/components/TopBar';
import AdminSystemPage from '@/components/AdminSystemPage';

export default function AdminSystem() {
  return (
    <>
      <TopBar
        title="System Health"
        subtitle="Infrastructure monitoring and queue management"
      />
      <AdminSystemPage />
    </>
  );
}
