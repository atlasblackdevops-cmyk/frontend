"use client";

import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import FertilizerSection from "@/components/crops/fertilizer/FertilizerSection";

export default function FertilizerPage() {
    return (
        <RequireAuth>
            <FarmGate>
                <DashboardLayoutWrapper>
                    <FertilizerSection />
                </DashboardLayoutWrapper>
            </FarmGate>
        </RequireAuth>
    );
}

