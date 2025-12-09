"use client";

import { useState } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    FieldRecord,
    PaginationInfo,
    FilterValues,
    GetFieldsParams,
    CreateFieldData,
} from "../types";
import {
    getFields,
    getFieldDetails,
    getActiveFields,
    createField,
    updateField,
    deleteField,
} from "@/lib/fields/api";

export function useFields() {
    const { farmId } = useAuth();
    const [fields, setFields] = useState<FieldRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchFields = async (
        page: number = 1,
        filters?: {
            search?: string;
            soilType?: string;
            isActive?: boolean;
        }
    ) => {
        if (!farmId) {
            setError("Farm ID is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params: GetFieldsParams = {
                page,
                limit: pagination.limit,
                ...filters,
            };

            const response = await getFields(params);
            const responseData = response?.data ?? {};
            const fieldsData = responseData?.fields ?? [];
            const paginationData = responseData?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            };

            const formattedFields: FieldRecord[] = fieldsData.map(
                (item: any) => ({
                    id: item.id,
                    farmId: item.farmId,
                    fieldName: item.fieldName,
                    fieldSize: item.fieldSize,
                    sizeUnit: item.sizeUnit,
                    soilType: item.soilType,
                    isActive: item.isActive,
                    notes: item.notes,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                })
            );

            setFields(formattedFields);
            setPagination(paginationData);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch fields";
            setError(errorMessage);
            setFields([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFieldDetails = async (
        fieldId: string
    ): Promise<FieldRecord | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const field = await getFieldDetails(fieldId);
            return field;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch field details";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActiveFields = async (): Promise<FieldRecord[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const fields = await getActiveFields();
            return fields;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to fetch active fields";
            setError(errorMessage);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const createFieldRecord = async (
        data: CreateFieldData
    ): Promise<boolean> => {
        if (!farmId) {
            setError("Farm ID is required");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await createField(data);
            await fetchFields(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to create field";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateFieldRecord = async (
        fieldId: string,
        data: CreateFieldData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await updateField(fieldId, data);
            await fetchFields(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to update field";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteFieldRecord = async (fieldId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await deleteField(fieldId);
            await fetchFields(pagination.page);
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ??
                err?.message ??
                "Failed to delete field";
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fields,
        isLoading,
        pagination,
        error,
        fetchFields,
        fetchFieldDetails,
        fetchActiveFields,
        createField: createFieldRecord,
        updateField: updateFieldRecord,
        deleteField: deleteFieldRecord,
        setPagination,
    };
}

