import { GuestOnly } from "@/components/auth/GuestOnly";
import Home from "@/view/home";

// This page is static - GuestOnly component handles auth redirects client-side
export default function HomePage() {
    return (
        <GuestOnly to="/dashboard">
            <Home />
        </GuestOnly>
    );
}
