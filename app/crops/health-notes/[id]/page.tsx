"use client";

import { use } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import CropHealthNoteDetailPage from '@/components/crops/health/components/CropHealthNoteDetailPage';

export default function CropHealthNoteDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <CropHealthNoteDetailPage noteId={id} />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

