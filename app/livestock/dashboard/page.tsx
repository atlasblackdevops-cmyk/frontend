import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import LivestockDashboardSection from '@/components/livestock/LivestockDashboardSection';

export default function LivestockDashboardPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <LivestockDashboardSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

