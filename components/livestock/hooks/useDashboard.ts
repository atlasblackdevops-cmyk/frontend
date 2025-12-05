"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/stores/use-auth-store";
import {
    getDashboardStats,
    getWeightTrends,
    getFeedTrends,
} from "@/lib/livestock/api";

export interface DashboardStats {
    totalAnimals: number;
    averageWeight: number | null;
    vaccinationCompliance: number; // Percentage
    totalWeightRecords: number;
    weightTrends: Array<{
        date: string;
        averageWeight: number;
        count: number;
    }>;
    feedEntriesTrends: Array<{
        date: string;
        totalQuantity: number;
        count: number;
    }>;
}

export function useDashboard() {
    const { farmId } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalAnimals: 0,
        averageWeight: null,
        vaccinationCompliance: 0,
        totalWeightRecords: 0,
        weightTrends: [],
        feedEntriesTrends: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        if (!farmId) {
            setError("Farm ID is required");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch dashboard stats, weight trends, and feed trends in parallel
            const [dashboardData, weightTrendsData, feedTrendsData] =
                await Promise.all([
                    getDashboardStats(),
                    getWeightTrends(),
                    getFeedTrends(),
                ]);

            setStats({
                totalAnimals: dashboardData.totalAnimals,
                averageWeight: dashboardData.averageWeight,
                vaccinationCompliance: dashboardData.vaccinationCompliance,
                totalWeightRecords: dashboardData.totalWeightRecords,
                weightTrends: weightTrendsData,
                feedEntriesTrends: feedTrendsData,
            });
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to fetch dashboard data"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [farmId]);

    return {
        stats,
        isLoading,
        error,
        refetch: fetchDashboardData,
    };
}
