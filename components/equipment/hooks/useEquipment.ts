"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    EquipmentRecord,
    PaginationInfo,
} from "../types";
import {
    getEquipment,
    getEquipmentDetails,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    type GetEquipmentParams,
    type CreateEquipmentData,
    type UpdateEquipmentData,
} from "@/lib/equipment/api";

interface FetchEquipmentFilters {
    search?: string;
    equipmentType?: string;
    status?: string;
}

interface MutationResult {
    success: boolean;
    data?: EquipmentRecord;
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

export function useEquipment() {
    const { farmId } = useAuth();
    
    const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
    const [error, setError] = useState<string | null>(null);

    const fetchEquipment = useCallback(
        async (page: number = 1, filters?: FetchEquipmentFilters) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetEquipmentParams = {
                    page,
                    limit: pagination.limit,
                    ...filters,
                };

                const response = await getEquipment(params);
                const responseData = response?.data;
                const equipmentData = responseData?.equipment ?? [];
                const paginationData = responseData?.pagination ?? DEFAULT_PAGINATION;

                setEquipment(equipmentData);
                setPagination(paginationData);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch equipment");
                setError(errorMessage);
                setEquipment([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.limit]
    );

    const fetchEquipmentDetails = useCallback(
        async (equipmentId: string): Promise<EquipmentRecord | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const equipmentData = await getEquipmentDetails(equipmentId);
                return equipmentData;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch equipment details");
                setError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createEquipmentRecord = useCallback(
        async (data: CreateEquipmentData): Promise<MutationResult> => {
            if (!farmId) {
                const errorMsg = "Farm ID is required";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            setIsLoading(true);
            setError(null);

            try {
                await createEquipment(data);
                
                await fetchEquipment(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to create equipment");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.page, fetchEquipment]
    );

    const updateEquipmentRecord = useCallback(
        async (equipmentId: string, data: UpdateEquipmentData): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await updateEquipment(equipmentId, data);

                await fetchEquipment(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to update equipment");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchEquipment]
    );

    const deleteEquipmentRecord = useCallback(
        async (equipmentId: string): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await deleteEquipment(equipmentId);
                
                await fetchEquipment(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to delete equipment");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchEquipment]
    );

    return {
        equipment,
        isLoading,
        pagination,
        error,
        fetchEquipment,
        fetchEquipmentDetails,
        createEquipment: createEquipmentRecord,
        updateEquipment: updateEquipmentRecord,
        deleteEquipment: deleteEquipmentRecord,
        setPagination,
    };
}

