"use client";

import { useState } from "react";
import type { WeightRecord } from "../types";
import {
    getWeightRecords,
    createWeightRecord,
    updateWeightRecord,
    type CreateWeightRecordData,
} from "@/lib/livestock/api";

export function useWeightRecords(animalId: string | null) {
    const [records, setRecords] = useState<WeightRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = async () => {
        if (!animalId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWeightRecords(animalId);
            setRecords(data.records);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch weight records"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (data: CreateWeightRecordData): Promise<void> => {
        if (!animalId) {
            throw new Error("Animal ID is required");
        }
        setError(null);
        await createWeightRecord(animalId, data);
        await fetchRecords();
    };

    const handleUpdate = async (
        recordId: string,
        data: CreateWeightRecordData
    ): Promise<void> => {
        if (!animalId) {
            throw new Error("Animal ID is required");
        }
        setError(null);
        await updateWeightRecord(animalId, recordId, data);
        await fetchRecords();
    };

    return {
        records,
        isLoading,
        error,
        fetchRecords,
        createRecord: handleCreate,
        updateRecord: handleUpdate,
    };
}

