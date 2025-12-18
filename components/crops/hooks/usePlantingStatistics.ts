"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/stores/use-auth-store";
import { getPlantingStatistics } from "@/lib/crops/api";
import type { PlantingStatisticsData } from "../types";

export function usePlantingStatistics() {
    const { farmId } = useAuth();
    const farm = useAuth();
    console.log(farmId,'farmId')
    console.log(farm,'farm')
    const [statistics, setStatistics] = useState<PlantingStatisticsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatistics = async () => {
        if (!farmId) {
            setError("Farm ID is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getPlantingStatistics();
            setStatistics(response.data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch planting statistics";
            setError(message);
            console.error("Error fetching planting statistics:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (farmId) {
            void fetchStatistics();
        }
    }, [farmId]);

    return {
        statistics,
        isLoading,
        error,
        refetch: fetchStatistics,
    };
}

