"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    MaintenanceLogRecord,
    PaginationInfo,
} from "../types";
import {
    getMaintenanceLogs,
    getMaintenanceLogDetails,
    createMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    type GetMaintenanceLogsParams,
    type CreateMaintenanceLogData,
} from "@/lib/equipment/api";

interface FetchMaintenanceLogsFilters {
    equipmentId?: string;
    maintenanceType?: string;
    maintenanceDateFrom?: string;
    maintenanceDateTo?: string;
}

interface MutationResult {
    success: boolean;
    data?: MaintenanceLogRecord;
    error?: string;
}

const DEFAULT_PAGINATION: PaginationInfo = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

function extractErrorMessage(err: any, defaultMessage: string): string {
    return (
        err?.response?.data?.message ??
        err?.message ??
        defaultMessage
    );
}

export function useMaintenanceLogs() {
    const { farmId } = useAuth();
    
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
    const [error, setError] = useState<string | null>(null);

    const fetchMaintenanceLogs = useCallback(
        async (page: number = 1, filters?: FetchMaintenanceLogsFilters) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetMaintenanceLogsParams = {
                    page,
                    limit: pagination.limit,
                    ...filters,
                };

                const response = await getMaintenanceLogs(params);
                const responseData = response?.data;
                const logsData = responseData?.maintenanceLogs ?? [];
                const paginationData = responseData?.pagination ?? DEFAULT_PAGINATION;

                setMaintenanceLogs(logsData);
                setPagination(paginationData);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch maintenance logs");
                setError(errorMessage);
                setMaintenanceLogs([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.limit]
    );

    const fetchMaintenanceLogDetails = useCallback(
        async (logId: string): Promise<MaintenanceLogRecord | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const logData = await getMaintenanceLogDetails(logId);
                return logData;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch maintenance log details");
                setError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createMaintenanceLogRecord = useCallback(
        async (data: CreateMaintenanceLogData): Promise<MutationResult> => {
            if (!farmId) {
                const errorMsg = "Farm ID is required";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            setIsLoading(true);
            setError(null);

            try {
                await createMaintenanceLog(data);
                
                await fetchMaintenanceLogs(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to create maintenance log");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.page, fetchMaintenanceLogs]
    );

    const updateMaintenanceLogRecord = useCallback(
        async (logId: string, data: Partial<CreateMaintenanceLogData>): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await updateMaintenanceLog(logId, data);

                await fetchMaintenanceLogs(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to update maintenance log");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchMaintenanceLogs]
    );

    const deleteMaintenanceLogRecord = useCallback(
        async (logId: string): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await deleteMaintenanceLog(logId);
                
                await fetchMaintenanceLogs(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to delete maintenance log");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchMaintenanceLogs]
    );

    return {
        maintenanceLogs,
        isLoading,
        pagination,
        error,
        fetchMaintenanceLogs,
        fetchMaintenanceLogDetails,
        createMaintenanceLog: createMaintenanceLogRecord,
        updateMaintenanceLog: updateMaintenanceLogRecord,
        deleteMaintenanceLog: deleteMaintenanceLogRecord,
        setPagination,
    };
}

