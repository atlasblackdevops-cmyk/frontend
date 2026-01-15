import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import RevenueSection from '@/components/finance/revenue/RevenueSection';

export default function RevenuePage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <RevenueSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

