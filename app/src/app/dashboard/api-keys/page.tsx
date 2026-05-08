import TopBar from '@/components/TopBar';
import ApiKeysPage from '@/components/ApiKeysPage';

export default function ApiKeys() {
  return (
    <>
      <TopBar
        title="API Keys"
        subtitle="Manage API keys and access credentials"
      />
      <ApiKeysPage />
    </>
  );
}
