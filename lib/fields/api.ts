import { api } from "@/lib/api";
import type {
    FieldsApiResponse,
    FieldDetailsResponse,
    FieldRecord,
    ApiFieldResponse,
    PaginationInfo,
    GetFieldsParams,
    CreateFieldData,
} from "@/components/fields/types";

/**
 * Get list of fields with filters and pagination
 */
export async function getFields(
    params: GetFieldsParams = {}
): Promise<FieldsApiResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.search?.trim()) {
        queryParams.append("search", params.search.trim());
    }
    if (params.soilType && params.soilType !== "all") {
        queryParams.append("soilType", params.soilType);
    }
    if (params.isActive !== undefined) {
        queryParams.append("isActive", params.isActive.toString());
    }

    const response = await api.get<FieldsApiResponse>(
        `/api/v1/fields?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single field details by ID
 */
export async function getFieldDetails(
    fieldId: string
): Promise<FieldRecord> {
    const response = await api.get<FieldDetailsResponse>(
        `/api/v1/fields/${fieldId}`
    );

    const responseData = response.data?.data ?? response.data;
    const fieldData = responseData?.field;
    
    if (!fieldData) {
        throw new Error("Field data not found");
    }

    return {
        id: fieldData.id,
        farmId: fieldData.farmId,
        fieldName: fieldData.fieldName,
        fieldSize: fieldData.fieldSize,
        sizeUnit: fieldData.sizeUnit,
        soilType: fieldData.soilType,
        isActive: fieldData.isActive,
        notes: fieldData.notes,
        createdAt: fieldData.createdAt,
        updatedAt: fieldData.updatedAt,
    };
}

/**
 * Get all active fields (for dropdowns)
 */
export async function getActiveFields(): Promise<FieldRecord[]> {
    const response = await api.get<FieldsApiResponse>(`/api/v1/fields/active`);

    const responseData = response.data?.data ?? {};
    const fieldsData = responseData?.fields ?? [];

    return fieldsData.map((item: ApiFieldResponse) => ({
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
    }));
}

/**
 * Create a new field
 */
export async function createField(data: CreateFieldData): Promise<void> {
    const payload: any = {
        fieldName: data.fieldName,
    };

    if (data.fieldSize !== undefined && data.fieldSize !== null) {
        payload.fieldSize = data.fieldSize;
    }
    if (data.sizeUnit) {
        payload.sizeUnit = data.sizeUnit;
    }
    if (data.soilType) {
        payload.soilType = data.soilType;
    }
    if (data.isActive !== undefined) {
        payload.isActive = data.isActive;
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/fields", payload);
}

/**
 * Update an existing field
 */
export async function updateField(
    fieldId: string,
    data: CreateFieldData
): Promise<void> {
    const payload: any = {
        fieldName: data.fieldName,
    };

    if (data.fieldSize !== undefined && data.fieldSize !== null) {
        payload.fieldSize = data.fieldSize;
    }
    if (data.sizeUnit) {
        payload.sizeUnit = data.sizeUnit;
    }
    if (data.soilType) {
        payload.soilType = data.soilType;
    }
    if (data.isActive !== undefined) {
        payload.isActive = data.isActive;
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.put(`/api/v1/fields/${fieldId}`, payload);
}

/**
 * Delete a field
 */
export async function deleteField(fieldId: string): Promise<void> {
    await api.delete(`/api/v1/fields/${fieldId}`);
}

