import TopBar from '@/components/TopBar';
import CampaignsPage from '@/components/CampaignsPage';

export default function Campaigns() {
  return (
    <>
      <TopBar
        title="Campaigns"
        subtitle="Manage your URL indexing campaigns"
      />
      <CampaignsPage />
    </>
  );
}
