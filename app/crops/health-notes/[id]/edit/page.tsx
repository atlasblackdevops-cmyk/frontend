"use client";

import { use } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import CropHealthNoteForm from '@/components/crops/health/components/CropHealthNoteForm';

export default function EditCropHealthNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <RequireAuth>
      <FarmGate>
        <DashboardLayoutWrapper>
          <CropHealthNoteForm mode="update" noteId={id} />
        </DashboardLayoutWrapper>
      </FarmGate>
    </RequireAuth>
  );
}

