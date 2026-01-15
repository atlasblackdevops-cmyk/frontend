"use client";

import { useState } from "react";
import type {
    ExpenseRecord,
    GetExpensesParams,
    CreateExpenseData,
    PaginationInfo,
} from "../types";
import {
    getExpenses,
    getExpenseDetails,
    createExpense,
    updateExpense,
    deleteExpense,
} from "@/lib/finance/expense/api";

export function useExpenses() {
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = async (
        page: number = 1,
        filters?: {
            search?: string;
            categoryId?: string;
            expenseDateFrom?: string;
            expenseDateTo?: string;
        }
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const params: GetExpensesParams = {
                page,
                limit: pagination.limit,
                ...filters,
            };

            const response = await getExpenses(params);
            const responseData = response?.data ?? {};
            const expensesData = responseData?.expenses ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };

            const formattedExpenses: ExpenseRecord[] = expensesData.map(
                (item: any) => ({
                    id: item.id,
                    categoryId: item.categoryId || item.category?.id || null,
                    otherCategoryName: item.otherCategoryName,
                    categoryName:
                        item.category?.categoryName ||
                        item.otherCategoryName ||
                        "Unknown",
                    expenseDate: item.expenseDate,
                    amount:
                        typeof item.amount === "string"
                            ? parseFloat(item.amount)
                            : item.amount,
                    currencyType: item.currencyType,
                    vendor: item.vendor,
                    description: item.description,
                    paymentMethod: item.paymentMethod,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    category: item.category,
                })
            );

            setExpenses(formattedExpenses);
            setPagination(paginationData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch expenses";
            setError(errorMessage);
            setExpenses([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExpenseDetails = async (
        expenseId: string
    ): Promise<ExpenseRecord | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const expense = await getExpenseDetails(expenseId);
            return expense;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch expense details";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createExpenseRecord = async (
        data: CreateExpenseData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await createExpense(data);
            // Refresh the list
            await fetchExpenses(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create expense";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateExpenseRecord = async (
        expenseId: string,
        data: CreateExpenseData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await updateExpense(expenseId, data);
            // Refresh the list
            await fetchExpenses(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update expense";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteExpenseRecord = async (expenseId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await deleteExpense(expenseId);
            // Refresh the list
            await fetchExpenses(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete expense";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        expenses,
        isLoading,
        pagination,
        error,
        fetchExpenses,
        fetchExpenseDetails,
        createExpense: createExpenseRecord,
        updateExpense: updateExpenseRecord,
        deleteExpense: deleteExpenseRecord,
        setPagination,
    };
}
