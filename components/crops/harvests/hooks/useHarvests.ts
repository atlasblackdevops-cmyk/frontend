"use client";

import { useState } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    HarvestRecord,
    PaginationInfo,
    FilterValues,
    GetHarvestsParams,
    CreateHarvestData,
} from "../types";
import {
    getHarvests,
    getHarvestDetails,
    createHarvest,
    updateHarvest,
    deleteHarvest,
} from "@/lib/crops/api";

export function useHarvests() {
    const { farmId } = useAuth();
    const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchHarvests = async (
        page: number = 1,
        filters?: {
            search?: string;
            cropType?: string;
            fieldId?: string;
            harvestDateFrom?: string;
            harvestDateTo?: string;
        }
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetHarvestsParams = {
                page,
                limit: pagination.limit,
                ...filters,
            };

            const response = await getHarvests(params);
            const responseData = response?.data ?? {};
            const harvestsData = responseData?.harvests ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };

            const formattedHarvests: HarvestRecord[] = harvestsData.map(
                (item: any) => ({
                    id: item.id,
                    fieldId: item.field?.id || "",
                    fieldName: item.field?.fieldName,
                    harvestDate: item.harvestDate,
                    yieldAmount:
                        typeof item.yieldAmount === "string"
                            ? parseFloat(item.yieldAmount)
                            : item.yieldAmount,
                    yieldUnit: item.yieldUnit,
                    cropType: item.cropType,
                    notes: item.notes,
                    plantingRecordId: item.plantingRecord?.id || null,
                    plantingRecord: item.plantingRecord
                        ? {
                              id: item.plantingRecord.id || "",
                              crop: item.plantingRecord.crop || "",
                              plantingDate:
                                  item.plantingRecord.plantingDate || "",
                          }
                        : null,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })
            );

            setHarvests(formattedHarvests);
            setPagination(paginationData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch harvests";
            setError(errorMessage);
            setHarvests([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHarvestDetails = async (
        harvestId: string
    ): Promise<HarvestRecord | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const harvest = await getHarvestDetails(harvestId);
            return harvest;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch harvest details";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createHarvestRecord = async (
        data: CreateHarvestData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Try API first
            try {
                await createHarvest(data);
                await fetchHarvests(pagination.page);
                return true;
            } catch (apiErr: any) {
                // If API fails, show error
                const errorMessage =
                    apiErr?.response?.data?.message ??
                    apiErr?.message ??
                    "Failed to create harvest";
                setError(errorMessage);
                throw apiErr;
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create harvest";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateHarvestRecord = async (
        harvestId: string,
        data: CreateHarvestData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Try API first
            try {
                await updateHarvest(harvestId, data);
                await fetchHarvests(pagination.page);
                return true;
            } catch (apiErr: any) {
                // If API fails, show error
                const errorMessage =
                    apiErr?.response?.data?.message ??
                    apiErr?.message ??
                    "Failed to update harvest";
                setError(errorMessage);
                throw apiErr;
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update harvest";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHarvestRecord = async (harvestId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Try API first
            try {
                await deleteHarvest(harvestId);
                await fetchHarvests(pagination.page);
                return true;
            } catch (apiErr: any) {
                // If API fails, show error
                const errorMessage =
                    apiErr?.response?.data?.message ??
                    apiErr?.message ??
                    "Failed to delete harvest";
                setError(errorMessage);
                throw apiErr;
            }
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete harvest";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        harvests,
        isLoading,
        pagination,
        error,
        fetchHarvests,
        fetchHarvestDetails,
        createHarvest: createHarvestRecord,
        updateHarvest: updateHarvestRecord,
        deleteHarvest: deleteHarvestRecord,
        setPagination,
    };
}
