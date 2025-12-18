import { Suspense } from "react";
import { OwnerOnly } from "@/components/auth/OwnerOnly";
import PaymentSuccessComponent from "@/components/subscription/PaymentSuccessComponent";

export default function PaymentSuccessPage() {
    return (
        <OwnerOnly>
            <Suspense fallback={<div>Loading...</div>}>
                <PaymentSuccessComponent />
            </Suspense>
        </OwnerOnly>
    );
}
