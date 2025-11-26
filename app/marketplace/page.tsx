import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import ListingPage from '@/components/listing/ListingPage';

export default function MarketplacePage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <ListingPage title="Marketplace" />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

