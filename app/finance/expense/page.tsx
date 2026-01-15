import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import ExpenseSection from '@/components/finance/expense/ExpenseSection';

export default function ExpensePage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <ExpenseSection />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

