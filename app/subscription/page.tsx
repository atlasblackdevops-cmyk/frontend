import { OwnerOnly } from "@/components/auth/OwnerOnly";
import PricingPageComponent from "@/components/pricing/PricingPageComponent";

export default function PricingPage() {
    return (
        <OwnerOnly>
            <PricingPageComponent />
        </OwnerOnly>
    );
}