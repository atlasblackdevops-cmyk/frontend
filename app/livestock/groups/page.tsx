import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import GroupsSection from '@/components/livestock/GroupsSection';

export default function LivestockGroupsPage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <GroupsSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

