import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import EquipmentSection from '@/components/equipment/EquipmentSection';

export default function EquipmentPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <EquipmentSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

