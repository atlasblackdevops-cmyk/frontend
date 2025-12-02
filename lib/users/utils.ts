import type { PermissionMatrix, ModuleDefinition } from "@/components/users/types";

export const buildEmptyPermissionState = (
    modules: ModuleDefinition[]
): PermissionMatrix =>
    modules.reduce<PermissionMatrix>((acc, module) => {
        acc[module.module] = [];
        return acc;
    }, {});

export const normalizePermissions = (
    modules: ModuleDefinition[],
    matrix?: PermissionMatrix
): PermissionMatrix => {
    const emptyState = buildEmptyPermissionState(modules);
    if (!matrix) return emptyState;
    const normalized: PermissionMatrix = {};
    modules.forEach((module) => {
        const allowed = matrix[module.module] ?? [];
        normalized[module.module] = module.actions.filter((action) =>
            allowed.includes(action)
        );
    });
    return { ...emptyState, ...normalized };
};

export const toTitleCase = (value: string) => {
    if (!value) return value;
    return value
        .toLowerCase()
        .split(/[\s_]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

