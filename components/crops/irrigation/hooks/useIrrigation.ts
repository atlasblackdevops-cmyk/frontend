"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    IrrigationRecord,
    PaginationInfo,
    FilterValues,
    GetIrrigationsParams,
    CreateIrrigationData,
} from "../types";
import {
    getIrrigations,
    getIrrigationDetails,
    createIrrigation,
    updateIrrigation,
    deleteIrrigation,
    getIrrigationCostSummary,
} from "@/lib/crops/irrigation/api";
import type { IrrigationCostSummaryItem } from "../types";

export function useIrrigation() {
    const { farmId } = useAuth();
    const [irrigations, setIrrigations] = useState<IrrigationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchIrrigations = useCallback(
        async (
            page: number = 1,
            filters?: {
                search?: string;
                fieldId?: string;
                irrigationDateFrom?: string;
                irrigationDateTo?: string;
            }
        ) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetIrrigationsParams = {
                    page,
                    limit: 10,
                };

                if (filters?.fieldId && filters.fieldId !== "all") {
                    params.fieldId = filters.fieldId;
                }
                if (filters?.irrigationDateFrom) {
                    params.irrigationDateFrom = filters.irrigationDateFrom;
                }
                if (filters?.irrigationDateTo) {
                    params.irrigationDateTo = filters.irrigationDateTo;
                }

                const response = await getIrrigations(params);
                const apiIrrigations = response.data?.irrigations || [];
                const paginationInfo = response.data?.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                };

                let irrigationRecords: IrrigationRecord[] = apiIrrigations.map(
                    (item) => ({
                        id: item.id,
                        fieldId: item.field?.id || item.fieldId || "",
                        fieldName: item.field?.fieldName,
                        irrigationDate: typeof item.irrigationDate === 'string' 
                            ? item.irrigationDate 
                            : new Date(item.irrigationDate).toISOString().split('T')[0],
                        irrigationMethod: item.irrigationMethod || null,
                        waterVolume: item.waterVolume || null,
                        volumeUnit: item.volumeUnit || null,
                        durationMinutes: item.durationMinutes || null,
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
                    irrigationRecords = irrigationRecords.filter((record) => {
                        const fieldName = (record.fieldName || "").toLowerCase();
                        const irrigationMethod = (record.irrigationMethod || "").toLowerCase();
                        const notes = (record.notes || "").toLowerCase();
                        return (
                            fieldName.includes(searchTerm) ||
                            irrigationMethod.includes(searchTerm) ||
                            notes.includes(searchTerm)
                        );
                    });
                }

                setIrrigations(irrigationRecords);
                setPagination(paginationInfo);
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch irrigation records";
                setError(errorMessage);
                setIrrigations([]);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId]
    );

    const fetchIrrigationDetails = useCallback(async (irrigationId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const irrigation = await getIrrigationDetails(irrigationId);
            return irrigation;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch irrigation details";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createIrrigationRecord = async (
        data: CreateIrrigationData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await createIrrigation(data);
            await fetchIrrigations(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create irrigation record";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateIrrigationRecord = async (
        irrigationId: string,
        data: CreateIrrigationData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await updateIrrigation(irrigationId, data);
            await fetchIrrigations(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update irrigation record";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteIrrigationRecord = async (irrigationId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await deleteIrrigation(irrigationId);
            await fetchIrrigations(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete irrigation record";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const [costSummary, setCostSummary] = useState<{
        summary: IrrigationCostSummaryItem[];
        totalFields: number;
        totalCost: number;
    } | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const fetchCostSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        setError(null);
        try {
            const response = await getIrrigationCostSummary();
            setCostSummary({
                summary: response.data.summary,
                totalFields: response.data.totalFields,
                totalCost: response.data.totalCost,
            });
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch cost summary";
            setError(errorMessage);
        } finally {
            setIsLoadingSummary(false);
        }
    }, []);

    return {
        irrigations,
        isLoading,
        pagination,
        error,
        fetchIrrigations,
        fetchIrrigationDetails,
        createIrrigation: createIrrigationRecord,
        updateIrrigation: updateIrrigationRecord,
        deleteIrrigation: deleteIrrigationRecord,
        setPagination,
        costSummary,
        isLoadingSummary,
        fetchCostSummary,
    };
}

