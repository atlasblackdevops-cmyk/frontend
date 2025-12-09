import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import FieldsSection from '@/components/fields/FieldsSection';

export default function FieldsPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <FieldsSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

