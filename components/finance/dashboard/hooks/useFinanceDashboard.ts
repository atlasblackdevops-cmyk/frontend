"use client";

import { useState } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    DashboardSummaryResponse,
    DashboardTrendsResponse,
    DashboardBreakdownResponse,
    GetDashboardSummaryParams,
    GetDashboardTrendsParams,
    GetDashboardBreakdownParams,
} from "../types";
import {
    getDashboardSummary,
    getDashboardTrends,
    getDashboardBreakdown,
} from "@/lib/finance/dashboard/api";

export function useFinanceDashboard() {
    const { farmId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = async (
        params: GetDashboardSummaryParams = {}
    ): Promise<DashboardSummaryResponse | null> => {
        if (!farmId) {
            setError("Farm ID is required");
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getDashboardSummary(params);
            return data;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch dashboard summary";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTrends = async (
        params: GetDashboardTrendsParams
    ): Promise<DashboardTrendsResponse | null> => {
        if (!farmId) {
            setError("Farm ID is required");
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getDashboardTrends(params);
            return data;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch dashboard trends";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBreakdown = async (
        params: GetDashboardBreakdownParams = {}
    ): Promise<DashboardBreakdownResponse | null> => {
        if (!farmId) {
            setError("Farm ID is required");
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getDashboardBreakdown(params);
            return data;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch dashboard breakdown";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        fetchSummary,
        fetchTrends,
        fetchBreakdown,
    };
}

