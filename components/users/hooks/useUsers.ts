"use client";

import { useState, useCallback } from "react";
import type {
    ManagedUser,
    ApiUserResponse,
    PaginationInfo,
    ModuleDefinition,
} from "../types";
import { getUsers, createUser, updateUser, addExistingUser } from "@/lib/users/api";
import { normalizePermissions, toTitleCase } from "@/lib/users/utils";
import type { GetUsersParams, CreateUserData, UpdateUserData, AddExistingUserData } from "@/lib/users/api";

interface UseUsersOptions {
    moduleDefinitions: ModuleDefinition[];
    filters: {
        search: string;
        role: string;
        status: string;
    };
}

export function useUsers({ moduleDefinitions, filters }: UseUsersOptions) {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const convertApiUserToManagedUser = useCallback(
        (apiUser: ApiUserResponse): ManagedUser => {
            const userPermissions: Record<string, string[]> = {};
            if (Array.isArray(apiUser.permissions)) {
                apiUser.permissions.forEach((perm) => {
                    const moduleName = toTitleCase(perm.module || "");
                    const action = perm.action?.toLowerCase() || "";
                    if (moduleName && action) {
                        if (!userPermissions[moduleName]) {
                            userPermissions[moduleName] = [];
                        }
                        userPermissions[moduleName].push(action);
                    }
                });
            }
            return {
                id: apiUser.user.id,
                name: apiUser.user.name,
                email: apiUser.user.email,
                status: apiUser.user.isActive ? "active" : "inactive",
                roleId: apiUser.role.id,
                roleName: apiUser.role.roleName,
                permissions: normalizePermissions(
                    moduleDefinitions,
                    userPermissions
                ),
                avatarColor: "cyan",
                isActive: apiUser.user.isActive,
                createdAt: apiUser.createdAt,
            };
        },
        [moduleDefinitions]
    );

    const fetchUsers = useCallback(
        async (page: number = 1, limit: number = 10) => {
            setIsLoading(true);
            setError(null);
            try {
                const params: GetUsersParams = {
                    page,
                    limit,
                };

                if (filters.role !== "all") {
                    params.roleId = filters.role;
                }

                if (filters.status !== "all") {
                    params.isActive = filters.status === "active" ? "true" : "false";
                }

                const response = await getUsers(params);
                const apiUsers = response.users || [];
                const paginationInfo = response.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                };

                const managedUsers = apiUsers.map(convertApiUserToManagedUser);
                // Apply client-side search filter if needed
                let finalUsers = managedUsers;
                if (filters.search.length > 0) {
                    finalUsers = managedUsers.filter((user) => {
                        const searchLower = filters.search.toLowerCase();
                        return (
                            user.name.toLowerCase().includes(searchLower) ||
                            user.email.toLowerCase().includes(searchLower)
                        );
                    });
                }

                setUsers(finalUsers);
                setPagination(paginationInfo);
            } catch (err: any) {
                setError(
                    err?.response?.data?.message ??
                        err?.message ??
                        "Failed to fetch users"
                );
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        },
        [filters, convertApiUserToManagedUser]
    );

    const handleCreateUser = useCallback(
        async (data: CreateUserData): Promise<ApiUserResponse> => {
            return await createUser(data);
        },
        []
    );

    const handleUpdateUser = useCallback(
        async (userId: string, data: UpdateUserData): Promise<ApiUserResponse> => {
            return await updateUser(userId, data);
        },
        []
    );

    const handleAddExistingUser = useCallback(
        async (data: AddExistingUserData): Promise<ApiUserResponse> => {
            return await addExistingUser(data);
        },
        []
    );

    return {
        users,
        isLoading,
        pagination,
        error,
        fetchUsers,
        createUser: handleCreateUser,
        updateUser: handleUpdateUser,
        addExistingUser: handleAddExistingUser,
        setUsers,
        setPagination,
    };
}

