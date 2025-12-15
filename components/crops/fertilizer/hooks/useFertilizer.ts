"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    FertilizerRecord,
    PaginationInfo,
    FilterValues,
    GetFertilizersParams,
    CreateFertilizerData,
} from "../types";
import {
    getFertilizers,
    getFertilizerDetails,
    createFertilizer,
    updateFertilizer,
    deleteFertilizer,
} from "@/lib/crops/fertilizer/api";

export function useFertilizer() {
    const { farmId } = useAuth();
    const [fertilizers, setFertilizers] = useState<FertilizerRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchFertilizers = useCallback(
        async (
            page: number = 1,
            filters?: {
                search?: string;
                fieldId?: string;
                applicationDateFrom?: string;
                applicationDateTo?: string;
            }
        ) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetFertilizersParams = {
                    page,
                    limit: 10,
                };

                if (filters?.fieldId && filters.fieldId !== "all") {
                    params.fieldId = filters.fieldId;
                }
                if (filters?.applicationDateFrom) {
                    params.applicationDateFrom = filters.applicationDateFrom;
                }
                if (filters?.applicationDateTo) {
                    params.applicationDateTo = filters.applicationDateTo;
                }

                const response = await getFertilizers(params);
                const apiFertilizers = response.data?.fertilizers || [];
                const paginationInfo = response.data?.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                };

                let fertilizerRecords: FertilizerRecord[] = apiFertilizers.map(
                    (item) => ({
                        id: item.id,
                        fieldId: item.field?.id || item.fieldId || "",
                        fieldName: item.field?.fieldName,
                        applicationDate: typeof item.applicationDate === 'string' 
                            ? item.applicationDate 
                            : new Date(item.applicationDate).toISOString().split('T')[0],
                        fertilizerType: item.fertilizerType || null,
                        quantity: item.quantity || null,
                        quantityUnit: item.quantityUnit || null,
                        applicationMethod: item.applicationMethod || null,
                        cost: item.cost || null,
                        notes: item.notes || null,
                        createdAt: typeof item.createdAt === 'string'
                            ? item.createdAt
                            : new Date(item.createdAt).toISOString(),
                        updatedAt: typeof item.updatedAt === 'string'
                            ? item.updatedAt
                            : new Date(item.updatedAt).toISOString(),
                    })
                );

                // Client-side search filtering
                if (filters?.search?.trim()) {
                    const searchTerm = filters.search.trim().toLowerCase();
                    fertilizerRecords = fertilizerRecords.filter((record) => {
                        const fieldName = (record.fieldName || "").toLowerCase();
                        const fertilizerType = (record.fertilizerType || "").toLowerCase();
                        const applicationMethod = (record.applicationMethod || "").toLowerCase();
                        const notes = (record.notes || "").toLowerCase();
                        return (
                            fieldName.includes(searchTerm) ||
                            fertilizerType.includes(searchTerm) ||
                            applicationMethod.includes(searchTerm) ||
                            notes.includes(searchTerm)
                        );
                    });
                }

                setFertilizers(fertilizerRecords);
                setPagination(paginationInfo);
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch fertilizer records";
                setError(errorMessage);
                setFertilizers([]);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId]
    );

    const fetchFertilizerDetails = useCallback(async (fertilizerId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const fertilizer = await getFertilizerDetails(fertilizerId);
            return fertilizer;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch fertilizer details";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createFertilizerRecord = async (
        data: CreateFertilizerData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await createFertilizer(data);
            await fetchFertilizers(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create fertilizer record";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateFertilizerRecord = async (
        fertilizerId: string,
        data: CreateFertilizerData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await updateFertilizer(fertilizerId, data);
            await fetchFertilizers(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update fertilizer record";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteFertilizerRecord = async (fertilizerId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await deleteFertilizer(fertilizerId);
            await fetchFertilizers(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete fertilizer record";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fertilizers,
        isLoading,
        pagination,
        error,
        fetchFertilizers,
        fetchFertilizerDetails,
        createFertilizer: createFertilizerRecord,
        updateFertilizer: updateFertilizerRecord,
        deleteFertilizer: deleteFertilizerRecord,
        setPagination,
    };
}

