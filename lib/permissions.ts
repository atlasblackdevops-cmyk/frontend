/**
 * Permission checking utilities
 */

export interface Permission {
    id: string;
    module: string;
    action: string;
    description?: string;
}

export type PermissionMatrix = Record<string, string[]>; // module -> actions[]

/**
 * Route/Tab to Permission Module mapping
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
    "/dashboard": "DASHBOARD",
    "/fields": "CROPS", // Fields use CROPS permissions
    "/livestock": "LIVESTOCK",
    "/crops": "CROPS",
    "/crops/planting": "CROPS",
    "/finance": "FINANCE",
    "/marketplace": "MARKETPLACE",
    "/ai": "AI",
    "/settings": "SETTINGS",
    "/users": "USERS",
};

/**
 * Check if user has permission for a route/module
 * @param route - Route path (e.g., "/livestock")
 * @param permissions - Array of permissions from user
 * @param role - User role (OWNER/SUPER_ADMIN have access to all)
 */
export function hasRoutePermission(
    route: string,
    permissions: Permission[] = [],
    role: string | null = null
): boolean {
    // OWNER and SUPER_ADMIN have access to all routes
    const roleUpper = String(role ?? "").toUpperCase();
    if (roleUpper === "OWNER" || roleUpper === "SUPER_ADMIN") {
        return true;
    }

    // Settings should always be accessible so every user can manage their profile
    if (route === "/settings") {
        return true;
    }

    const module = ROUTE_PERMISSIONS[route];
    if (!module) {
        // Unknown route - allow by default (for backwards compatibility)
        return true;
    }

    // Check if user has any permission for this module
    return permissions.some(
        (perm) => perm.module?.toUpperCase() === module.toUpperCase()
    );
}

/**
 * Check if user has specific permission (module + action)
 */
export function hasPermission(
    module: string,
    action: string,
    permissions: Permission[] = [],
    role: string | null = null
): boolean {
    // OWNER and SUPER_ADMIN have all permissions
    const roleUpper = String(role ?? "").toUpperCase();
    if (roleUpper === "OWNER" || roleUpper === "SUPER_ADMIN") {
        return true;
    }

    return permissions.some(
        (perm) =>
            perm.module?.toUpperCase() === module.toUpperCase() &&
            perm.action?.toUpperCase() === action.toUpperCase()
    );
}

/**
 * Check if user has any permission for a module
 */
export function hasModulePermission(
    module: string,
    permissions: Permission[] = [],
    role: string | null = null
): boolean {
    // OWNER and SUPER_ADMIN have all permissions
    const roleUpper = String(role ?? "").toUpperCase();
    if (roleUpper === "OWNER" || roleUpper === "SUPER_ADMIN") {
        return true;
    }

    return permissions.some(
        (perm) => perm.module?.toUpperCase() === module.toUpperCase()
    );
}

