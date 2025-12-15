import { RequireAuth } from '@/components/auth/RequireAuth';
import FarmGate from '@/components/guards/FarmGate';
import DashboardLayoutWrapper from '@/components/layouts/DashboardLayoutWrapper';
import IrrigationSection from "@/components/crops/irrigation/IrrigationSection";

export default function IrrigationPage() {
    return (
        <RequireAuth>
            <FarmGate>
                <DashboardLayoutWrapper>
                    <IrrigationSection />
                </DashboardLayoutWrapper>
            </FarmGate>
        </RequireAuth>
    );
}

