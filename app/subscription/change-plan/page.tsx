import { Suspense } from "react";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import PricingPageComponent from "@/components/pricing/PricingPageComponent";

export default function ChangePlanPage() {
    return (
        <OwnerOnly>
            <Suspense fallback={<div>Loading...</div>}>
                <PricingPageComponent mode="change-plan" />
            </Suspense>
        </OwnerOnly>
    );
}
