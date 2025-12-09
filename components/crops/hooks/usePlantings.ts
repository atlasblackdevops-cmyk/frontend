"use client";

import { useState } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    PlantingRecord,
    PaginationInfo,
    FilterValues,
    GetPlantingsParams,
    CreatePlantingData,
} from "../types";
import {
    getPlantings,
    getPlantingDetails,
    createPlanting,
    updatePlanting,
    deletePlanting,
} from "@/lib/crops/api";

export function usePlantings() {
    const { farmId } = useAuth();
    const [plantings, setPlantings] = useState<PlantingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchPlantings = async (
        page: number = 1,
        filters?: {
            search?: string;
            crop?: string;
            fieldId?: string;
            plantingDateFrom?: string;
            plantingDateTo?: string;
        }
    ) => {
        if (!farmId) {
            setError("Farm ID is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params: GetPlantingsParams = {
                farmId,
                page,
                limit: pagination.limit,
                ...filters,
            };

            const response = await getPlantings(params);
            const responseData = response?.data ?? {};
            const plantingsData = responseData?.plantings ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };

            const formattedPlantings: PlantingRecord[] = plantingsData.map(
                (item: any) => ({
                    id: item.id,
                    fieldId: item.fieldId,
                    fieldName: item.fieldName,
                    crop: item.crop,
                    seedType: item.seedType,
                    plantingDate: item.plantingDate,
                    expectedHarvestDate: item.expectedHarvestDate,
                    quantityPlanted: item.quantityPlanted,
                    quantityUnit: item.quantityUnit,
                    seedCost: item.seedCost,
                    area: item.area,
                    areaUnit: item.areaUnit,
                    notes: item.notes,
                    isActive: item.isActive,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })
            );

            setPlantings(formattedPlantings);
            setPagination(paginationData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch plantings";
            setError(errorMessage);
            setPlantings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlantingDetails = async (
        plantingId: string
    ): Promise<PlantingRecord | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const planting = await getPlantingDetails(plantingId);
            return planting;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch planting details";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createPlantingRecord = async (
        data: CreatePlantingData
    ): Promise<boolean> => {
        if (!farmId) {
            setError("Farm ID is required");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // farmId is optional on create; pass through as provided
            await createPlanting(data);
            // Refresh the list
            await fetchPlantings(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create planting";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updatePlantingRecord = async (
        plantingId: string,
        data: CreatePlantingData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = farmId ? { ...data, farmId } : data;
            await updatePlanting(plantingId, payload);
            // Refresh the list
            await fetchPlantings(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update planting";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePlantingRecord = async (plantingId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await deletePlanting(plantingId);
            // Refresh the list
            await fetchPlantings(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete planting";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        plantings,
        isLoading,
        pagination,
        error,
        fetchPlantings,
        fetchPlantingDetails,
        createPlanting: createPlantingRecord,
        updatePlanting: updatePlantingRecord,
        deletePlanting: deletePlantingRecord,
        setPagination,
    };
}

