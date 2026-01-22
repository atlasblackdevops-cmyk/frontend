import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import MyListingsSection from '@/components/marketplace/MyListingsSection';

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <MyListingsSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

