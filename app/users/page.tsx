import { RequireAuth } from "@/components/auth/RequireAuth";
import FarmGate from "@/components/guards/FarmGate";
import DashboardLayoutWrapper from "@/components/layouts/DashboardLayoutWrapper";
import UserManagementPage from "@/components/users/UserManagementPage";

export default function UsersPage() {
    return (
        <RequireAuth>
            <FarmGate>
                <DashboardLayoutWrapper>
                    <UserManagementPage />
                </DashboardLayoutWrapper>
            </FarmGate>
        </RequireAuth>
    );
}

