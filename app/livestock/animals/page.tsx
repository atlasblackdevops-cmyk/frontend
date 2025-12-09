import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import AnimalsSection from '@/components/livestock/AnimalsSection';

export default function LivestockAnimalsPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <AnimalsSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

