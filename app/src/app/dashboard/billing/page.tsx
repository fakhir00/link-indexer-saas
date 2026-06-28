import TopBar from '@/components/TopBar';
import BillingPage from '@/components/BillingPage';

export default function Billing() {
  return (
    <>
      <TopBar
        title="Credits"
        subtitle="Track usage and admin-managed credit allocation"
      />
      <BillingPage />
    </>
  );
}
