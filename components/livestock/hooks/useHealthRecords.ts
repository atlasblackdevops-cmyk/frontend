"use client";

import { useState } from "react";
import type { HealthRecord } from "../types";
import {
    getHealthRecords,
    createHealthRecord,
    updateHealthRecord,
    type CreateHealthRecordData,
} from "@/lib/livestock/api";

export function useHealthRecords(animalId: string | null) {
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = async () => {
        if (!animalId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getHealthRecords(animalId);
            setRecords(data.records);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch health records"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (data: CreateHealthRecordData): Promise<void> => {
        if (!animalId) {
            throw new Error("Animal ID is required");
        }
        setError(null);
        await createHealthRecord(animalId, data);
        await fetchRecords();
    };

    const handleUpdate = async (
        recordId: string,
        data: CreateHealthRecordData
    ): Promise<void> => {
        if (!animalId) {
            throw new Error("Animal ID is required");
        }
        setError(null);
        await updateHealthRecord(animalId, recordId, data);
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

