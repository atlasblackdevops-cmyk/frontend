import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import HarvestsSection from '@/components/crops/harvests/HarvestsSection';

export default function HarvestsPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <HarvestsSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

