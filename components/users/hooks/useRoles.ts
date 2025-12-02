"use client";

import { useState, useEffect } from "react";
import { getRoles } from "@/lib/users/api";
import { toTitleCase } from "@/lib/users/utils";
import type { AccessRole } from "../types";

export function useRoles() {
    const [roles, setRoles] = useState<AccessRole[]>([]);
    const [roleOptions, setRoleOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchRoles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const payload = await getRoles();
                if (!isMounted) return;

                if (payload.length) {
                    setRoles(payload);
                    const options = payload.map((role) => {
                        const formattedLabel = toTitleCase(role.roleName ?? "");
                        return {
                            value: role.id,
                            label: formattedLabel || role.roleName || role.id,
                        };
                    });
                    setRoleOptions(options);
                }
            } catch (err: any) {
                if (!isMounted) return;
                setError(
                    err?.response?.data?.message ??
                        err?.message ??
                        "Failed to fetch roles"
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchRoles();

        return () => {
            isMounted = false;
        };
    }, []);

    const getRoleLabel = (roleId: string) => {
        const role = roleOptions.find((r) => r.value === roleId);
        return role?.label ?? "Custom";
    };

    return {
        roles,
        roleOptions,
        isLoading,
        error,
        getRoleLabel,
    };
}

