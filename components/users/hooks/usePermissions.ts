"use client";

import { useState, useEffect, useMemo } from "react";
import { getPermissions } from "@/lib/users/api";
import { toTitleCase, buildEmptyPermissionState, normalizePermissions } from "@/lib/users/utils";
import type { PermissionModule, ModuleDefinition, PermissionMatrix } from "../types";

export function usePermissions() {
    const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
    const [moduleDefinitions, setModuleDefinitions] = useState<ModuleDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPermissions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const payload = await getPermissions();
                if (!isMounted) return;

                if (payload.length) {
                    // Store full permission modules with IDs
                    setPermissionModules(payload);

                    // Create normalized module definitions for UI
                    const normalized = payload
                        .map((module) => {
                            const rawModuleName = module?.module ?? "";
                            const moduleName =
                                toTitleCase(rawModuleName) || rawModuleName;
                            if (!moduleName) return null;
                            const actions = Array.isArray(module?.actions)
                                ? module.actions
                                      .map((action) =>
                                          typeof action?.action === "string"
                                              ? action.action.toLowerCase()
                                              : null
                                      )
                                      .filter(
                                          (action): action is string => !!action
                                      )
                                : [];
                            return {
                                module: moduleName,
                                actions,
                            } as ModuleDefinition;
                        })
                        .filter(Boolean) as ModuleDefinition[];

                    if (normalized.length) {
                        setModuleDefinitions(normalized);
                    }
                }
            } catch (err: any) {
                if (!isMounted) return;
                setError(
                    err?.response?.data?.message ??
                        err?.message ??
                        "Failed to fetch permissions"
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPermissions();

        return () => {
            isMounted = false;
        };
    }, []);

    const permissionColumns = useMemo(
        () =>
            Array.from(
                new Set(moduleDefinitions.flatMap((module) => module.actions))
            ),
        [moduleDefinitions]
    );

    const getPermissionIds = (selectedPermissions: PermissionMatrix): string[] => {
        const permissionIds: string[] = [];

        Object.entries(selectedPermissions).forEach(([moduleName, actions]) => {
            if (!actions.length) return;

            // Find the original module (case-insensitive match)
            const originalModule = permissionModules.find(
                (pm) => toTitleCase(pm.module) === moduleName
            );

            if (!originalModule) return;

            // For each selected action, find its permission ID
            actions.forEach((action) => {
                const permission = originalModule.actions.find(
                    (p) => p.action.toLowerCase() === action.toLowerCase()
                );
                if (permission?.id) {
                    permissionIds.push(permission.id);
                }
            });
        });

        return permissionIds;
    };

    const buildEmptyState = (): PermissionMatrix => {
        return buildEmptyPermissionState(moduleDefinitions);
    };

    const normalize = (matrix?: PermissionMatrix): PermissionMatrix => {
        return normalizePermissions(moduleDefinitions, matrix);
    };

    return {
        permissionModules,
        moduleDefinitions,
        permissionColumns,
        isLoading,
        error,
        getPermissionIds,
        buildEmptyState,
        normalize,
    };
}

