"use client";

import { useState } from "react";
import type {
    RevenueRecord,
    GetRevenuesParams,
    CreateRevenueData,
    PaginationInfo,
} from "../types";
import {
    getRevenues,
    getRevenueDetails,
    createRevenue,
    updateRevenue,
    deleteRevenue,
} from "@/lib/finance/revenue/api";

export function useRevenues() {
    const [revenues, setRevenues] = useState<RevenueRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchRevenues = async (
        page: number = 1,
        filters?: {
            search?: string;
            revenueDateFrom?: string;
            revenueDateTo?: string;
        }
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetRevenuesParams = {
                page,
                limit: pagination.limit,
                ...filters,
            };

            const response = await getRevenues(params);
            const responseData = response?.data ?? {};
            const revenuesData = responseData?.revenues ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };

            const formattedRevenues: RevenueRecord[] = revenuesData.map(
                (item: any) => ({
                    id: item.id,
                    revenueDate: item.revenueDate,
                    amount: typeof item.amount === "string" ? parseFloat(item.amount) : item.amount,
                    currencyType: item.currencyType,
                    buyerName: item.buyerName,
                    productSold: item.productSold,
                    quantity: item.quantity,
                    quantityUnit: item.quantityUnit,
                    paymentMethod: item.paymentMethod,
                    notes: item.notes,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })
            );

            setRevenues(formattedRevenues);
            setPagination(paginationData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch revenues";
            setError(errorMessage);
            setRevenues([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRevenueDetails = async (
        revenueId: string
    ): Promise<RevenueRecord | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const revenue = await getRevenueDetails(revenueId);
            return revenue;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch revenue details";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createRevenueRecord = async (
        data: CreateRevenueData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await createRevenue(data);
            // Refresh the list
            await fetchRevenues(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create revenue";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateRevenueRecord = async (
        revenueId: string,
        data: CreateRevenueData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await updateRevenue(revenueId, data);
            // Refresh the list
            await fetchRevenues(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update revenue";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRevenueRecord = async (revenueId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await deleteRevenue(revenueId);
            // Refresh the list
            await fetchRevenues(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete revenue";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        revenues,
        isLoading,
        pagination,
        error,
        fetchRevenues,
        fetchRevenueDetails,
        createRevenue: createRevenueRecord,
        updateRevenue: updateRevenueRecord,
        deleteRevenue: deleteRevenueRecord,
        setPagination,
    };
}

