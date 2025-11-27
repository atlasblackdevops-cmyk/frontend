"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/stores/use-auth-store";
import { hasRoutePermission } from "@/lib/permissions";

interface PermissionGateProps {
    children: React.ReactNode;
}

const STORAGE_KEY = "lastAuthorizedRoute";

/**
 * PermissionGate - Route guard based on user permissions
 * For non-OWNER/SUPER_ADMIN users, checks if they have permission for the current route
 */
export default function PermissionGate({ children }: PermissionGateProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { role, permissions, token } = useAuth();
    const hasRedirectedRef = useRef(false);
    const previousPathRef = useRef<string | null>(null);

    // Track last authorized route (route user has permission for)
    useEffect(() => {
        if (!token) return;

        const hasPermission = hasRoutePermission(pathname, permissions, role);

        // If user has permission for current route, store it as last authorized route
        if (hasPermission && pathname !== previousPathRef.current) {
            try {
                sessionStorage.setItem(STORAGE_KEY, pathname);
                previousPathRef.current = pathname;
            } catch {
                // Ignore storage errors
            }
        }
    }, [pathname, permissions, role, token]);

    useEffect(() => {
        // Only check permissions if user is authenticated
        if (!token) return;

        // Reset redirect flag when pathname changes
        hasRedirectedRef.current = false;

        // Check if user has permission for current route
        const hasPermission = hasRoutePermission(pathname, permissions, role);

        if (!hasPermission && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;

            // If trying to access dashboard without permission, redirect to last authorized route
            if (pathname === "/dashboard") {
                // Try to get last authorized route from sessionStorage
                let redirectTo = "/dashboard"; // Default fallback
                try {
                    const lastAuthorizedRoute = sessionStorage.getItem(STORAGE_KEY);
                    if (lastAuthorizedRoute && lastAuthorizedRoute !== "/dashboard") {
                        // Verify the last authorized route is still accessible
                        const hasPrevPermission = hasRoutePermission(
                            lastAuthorizedRoute,
                            permissions,
                            role
                        );
                        if (hasPrevPermission) {
                            redirectTo = lastAuthorizedRoute;
                        }
                    }
                } catch {
                    // Ignore storage errors, use default
                }
                router.replace(redirectTo);
            } else {
                // For other unauthorized routes, redirect to dashboard
                // But if dashboard is also not accessible, redirect to last authorized route
                const hasDashboardPermission = hasRoutePermission(
                    "/dashboard",
                    permissions,
                    role
                );
                if (hasDashboardPermission) {
                    router.replace("/dashboard");
                } else {
                    // Dashboard also not accessible, try last authorized route
                    let redirectTo = "/dashboard"; // Default fallback
                    try {
                        const lastAuthorizedRoute = sessionStorage.getItem(STORAGE_KEY);
                        if (lastAuthorizedRoute) {
                            const hasPrevPermission = hasRoutePermission(
                                lastAuthorizedRoute,
                                permissions,
                                role
                            );
                            if (hasPrevPermission) {
                                redirectTo = lastAuthorizedRoute;
                            }
                        }
                    } catch {
                        // Ignore storage errors
                    }
                    router.replace(redirectTo);
                }
            }
        }
    }, [pathname, permissions, role, token, router]);

    // Show children if user has permission or is OWNER/SUPER_ADMIN
    const hasPermission = hasRoutePermission(pathname, permissions, role);

    if (!token || hasPermission) {
        return <>{children}</>;
    }

    // Show loading state while redirecting
    return null;
}

