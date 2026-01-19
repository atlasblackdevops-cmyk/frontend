import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import FinanceDashboardSection from '@/components/finance/dashboard/FinanceDashboardSection';

export default function FinanceDashboardPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <FinanceDashboardSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

