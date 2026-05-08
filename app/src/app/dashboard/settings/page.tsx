import TopBar from '@/components/TopBar';
import SettingsPage from '@/components/SettingsPage';

export default function Settings() {
  return (
    <>
      <TopBar
        title="Settings"
        subtitle="Manage your account, notifications and integrations"
      />
      <SettingsPage />
    </>
  );
}
