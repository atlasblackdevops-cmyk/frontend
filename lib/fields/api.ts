import { api } from "@/lib/api";
import type {
    FieldsApiResponse,
    FieldDetailsResponse,
    FieldRecord,
    ApiFieldResponse,
    GetFieldsParams,
    CreateFieldData,
} from "@/components/fields/types";

function transformFieldData(fieldData: ApiFieldResponse): FieldRecord {
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

function buildQueryParams(params: GetFieldsParams = {}): URLSearchParams {
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

    return queryParams;
}

function buildFieldPayload(data: CreateFieldData): Record<string, any> {
    const payload: Record<string, any> = {
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

    return payload;
}

export async function getFields(
    params: GetFieldsParams = {}
): Promise<FieldsApiResponse> {
    const queryParams = buildQueryParams(params);
    const response = await api.get<FieldsApiResponse>(
        `/api/v1/fields?${queryParams.toString()}`
    );
    return response.data;
}

export async function getFieldDetails(fieldId: string): Promise<FieldRecord> {
    const response = await api.get<FieldDetailsResponse>(
        `/api/v1/fields/${fieldId}`
    );

    const responseData = response.data?.data ?? response.data;
    const fieldData = responseData?.field;
    
    if (!fieldData) {
        throw new Error("Field data not found");
    }

    return transformFieldData(fieldData);
}

export async function getActiveFields(): Promise<FieldRecord[]> {
    const response = await api.get<FieldsApiResponse>(`/api/v1/fields/active`);
    const responseData = response.data?.data ?? {};
    const fieldsData = responseData?.fields ?? [];

    return fieldsData.map(transformFieldData);
}


export async function getActiveFieldsPaginated(
    page: number = 1,
    limit: number = 20,
    search?: string
): Promise<FieldsApiResponse> {
    const queryParams = buildQueryParams({
        page,
        limit,
        isActive: true,
        search,
    });

    const response = await api.get<FieldsApiResponse>(
        `/api/v1/fields?${queryParams.toString()}`
    );

    return response.data;
}

export async function createField(data: CreateFieldData): Promise<FieldRecord> {
    const payload = buildFieldPayload(data);
    const response = await api.post<{ data: { field: ApiFieldResponse } }>(
        "/api/v1/fields",
        payload
    );
    
    const fieldData = response.data?.data?.field;
    if (!fieldData) {
        throw new Error("Field creation failed - no data returned");
    }
    
    return transformFieldData(fieldData);
}

export async function updateField(
    fieldId: string,
    data: CreateFieldData
): Promise<FieldRecord> {
    const payload = buildFieldPayload(data);
    const response = await api.put<{ data: { field: ApiFieldResponse } }>(
        `/api/v1/fields/${fieldId}`,
        payload
    );
    
    const fieldData = response.data?.data?.field;
    if (!fieldData) {
        throw new Error("Field update failed - no data returned");
    }
    
    return transformFieldData(fieldData);
}

export async function deleteField(fieldId: string): Promise<void> {
    await api.delete(`/api/v1/fields/${fieldId}`);
}

