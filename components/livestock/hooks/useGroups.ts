"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    AnimalGroup,
    PaginationInfo,
    AddGroupValues,
    UpdateGroupValues,
} from "../types";
import {
    getGroups,
    getGroupDetails,
    createGroup,
    updateGroup,
    deleteGroup,
    type GetGroupsParams,
} from "@/lib/livestock/api";

interface FetchGroupsFilters {
    search?: string;
}

interface MutationResult {
    success: boolean;
    data?: any;
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

export function useGroups() {
    const { farmId } = useAuth();
    
    const [groups, setGroups] = useState<AnimalGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(
        async (page: number = 1, filters?: FetchGroupsFilters) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetGroupsParams = {
                    page,
                    limit: pagination.limit,
                    ...filters,
                };

                const response = await getGroups(params);
                const responseData = response?.data ?? {};
                const groupsData = responseData?.groups ?? [];
                const paginationData = responseData?.pagination ?? DEFAULT_PAGINATION;

                setGroups(groupsData);
                setPagination(paginationData);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch groups");
                setError(errorMessage);
                setGroups([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.limit]
    );

    const fetchGroupDetails = useCallback(
        async (groupId: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const groupDetails = await getGroupDetails(groupId);
                return groupDetails;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch group details");
                setError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createGroupRecord = useCallback(
        async (data: AddGroupValues): Promise<MutationResult> => {
            if (!farmId) {
                const errorMsg = "Farm ID is required";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await createGroup(data);
                
                await fetchGroups(pagination.page);
                
                return { success: true, data: result };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to create group");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.page, fetchGroups]
    );

    const updateGroupRecord = useCallback(
        async (groupId: string, data: UpdateGroupValues): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await updateGroup(groupId, data);

                await fetchGroups(pagination.page);
                
                return { success: true, data: result };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to update group");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchGroups]
    );

    const deleteGroupRecord = useCallback(
        async (groupId: string): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await deleteGroup(groupId);
                
                await fetchGroups(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to delete group");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchGroups]
    );

    return {
        groups,
        isLoading,
        pagination,
        error,
        fetchGroups,
        fetchGroupDetails,
        createGroup: createGroupRecord,
        updateGroup: updateGroupRecord,
        deleteGroup: deleteGroupRecord,
        setPagination,
    };
}
