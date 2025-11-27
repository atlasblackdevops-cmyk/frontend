import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import SettingsPage from '@/components/settings/SettingsPage';

export default function SettingsPageRoute() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <SettingsPage />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

