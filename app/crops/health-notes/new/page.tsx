import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import CropHealthNoteForm from '@/components/crops/health/components/CropHealthNoteForm';

export default function NewCropHealthNotePage() {
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <CropHealthNoteForm mode="create" />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

