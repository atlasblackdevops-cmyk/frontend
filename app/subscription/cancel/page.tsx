import { Suspense } from "react";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import CancelPlanComponent from "@/components/subscription/CancelPlanComponent";

export default function CancelPlanPage() {
    return (
        <OwnerOnly>
            <Suspense fallback={<div>Loading...</div>}>
                <CancelPlanComponent />
            </Suspense>
        </OwnerOnly>
    );
}
