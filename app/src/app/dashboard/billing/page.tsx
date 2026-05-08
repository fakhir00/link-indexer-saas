import TopBar from '@/components/TopBar';
import BillingPage from '@/components/BillingPage';

export default function Billing() {
  return (
    <>
      <TopBar
        title="Billing & Credits"
        subtitle="Manage your subscription, credits and payment history"
      />
      <BillingPage />
    </>
  );
}
