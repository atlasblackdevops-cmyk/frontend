import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import ListingPage from '@/components/listing/ListingPage';

export default function FinancePage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <ListingPage title="Finance" />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

