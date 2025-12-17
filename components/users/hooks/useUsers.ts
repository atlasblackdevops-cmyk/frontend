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

interface MutationResult {
    success: boolean;
    data?: ApiUserResponse;
    error?: string;
}


const DEFAULT_PAGINATION: PaginationInfo = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

function extractErrorMessage(err: any, defaultMessage: string): string {
    return (
        err?.response?.data?.message ??
        err?.message ??
        defaultMessage
    );
}

export function useUsers({ moduleDefinitions, filters }: UseUsersOptions) {
    // State
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
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
                const paginationInfo = response.pagination || DEFAULT_PAGINATION;

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
                const errorMessage = extractErrorMessage(err, "Failed to fetch users");
                setError(errorMessage);
                setUsers([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [filters, convertApiUserToManagedUser]
    );

    const handleCreateUser = useCallback(
        async (data: CreateUserData): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const newUser = await createUser(data);
                
                // Refetch the current page to reflect the new user
                await fetchUsers(pagination.page, pagination.limit);
                
                return { success: true, data: newUser };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to create user");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, pagination.limit, fetchUsers]
    );

    const handleUpdateUser = useCallback(
        async (userId: string, data: UpdateUserData): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const updatedUser = await updateUser(userId, data);
                
                // Refetch the current page to reflect the updated user
                await fetchUsers(pagination.page, pagination.limit);
                
                return { success: true, data: updatedUser };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to update user");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, pagination.limit, fetchUsers]
    );

    const handleAddExistingUser = useCallback(
        async (data: AddExistingUserData): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const addedUser = await addExistingUser(data);
                
                // Refetch the current page to reflect the added user
                await fetchUsers(pagination.page, pagination.limit);
                
                return { success: true, data: addedUser };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to add existing user");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, pagination.limit, fetchUsers]
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

