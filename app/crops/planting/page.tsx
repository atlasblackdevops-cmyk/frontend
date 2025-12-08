import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import PlantingSection from '@/components/crops/planting/PlantingSection';

export default function PlantingPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <PlantingSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

