import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import BrowseMarketplaceSection from '@/components/marketplace/BrowseMarketplaceSection';

export default function BrowseMarketplacePage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <BrowseMarketplaceSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

