"use client";

import { useState } from "react";
import type { FeedRecord } from "../types";
import {
    getFeedRecords,
    createFeedRecord,
    updateFeedRecord,
    type CreateFeedRecordData,
} from "@/lib/livestock/api";

export function useFeedRecords(animalId: string | null) {
    const [records, setRecords] = useState<FeedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = async () => {
        if (!animalId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getFeedRecords(animalId);
            setRecords(data);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch feed records"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (data: CreateFeedRecordData): Promise<void> => {
        if (!animalId) {
            throw new Error("Animal ID is required");
        }
        setError(null);
        await createFeedRecord(animalId, data);
        await fetchRecords();
    };

    const handleUpdate = async (
        recordId: string,
        data: CreateFeedRecordData
    ): Promise<void> => {
        if (!animalId) {
            throw new Error("Animal ID is required");
        }
        setError(null);
        await updateFeedRecord(animalId, recordId, data);
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

