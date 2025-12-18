import { Suspense } from "react";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import PaymentFailedComponent from "@/components/subscription/PaymentFailedComponent";

export default function PaymentFailedPage() {
    return (
        <OwnerOnly>
            <Suspense fallback={<div>Loading...</div>}>
                <PaymentFailedComponent />
            </Suspense>
        </OwnerOnly>
    );
}
