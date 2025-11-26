import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import ListingPage from '@/components/listing/ListingPage';

export default function AppDashboard() {
  return (
    <RequireAuth>
      <FarmGate>
        <ListingPage title="Dashboard" />
      </FarmGate>
    </RequireAuth>
  );
}
