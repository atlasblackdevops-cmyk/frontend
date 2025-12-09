import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import CropHealthNotesSection from '@/components/crops/health/CropHealthNotesSection';

export default function CropHealthNotesPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <CropHealthNotesSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

