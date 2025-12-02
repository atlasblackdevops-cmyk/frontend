import { RequireAuth } from "@/components/auth/RequireAuth";
import FarmGate from "@/components/guards/FarmGate";
import LivestockAnimalsSection from "@/components/livestock/LivestockAnimalsSection";
import DashboardLayoutWrapper from "@/components/layouts/DashboardLayoutWrapper";

export default function LivestockPage() {
    return (
        <RequireAuth>
            <FarmGate>
                <DashboardLayoutWrapper>
                    <LivestockAnimalsSection />
                </DashboardLayoutWrapper>
            </FarmGate>
        </RequireAuth>
    );
}
