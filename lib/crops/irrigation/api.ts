import { api } from "@/lib/api";
import type {
    IrrigationApiResponse,
    IrrigationDetailsResponse,
    IrrigationRecord,
    ApiIrrigationResponse,
    GetIrrigationsParams,
    CreateIrrigationData,
} from "@/components/crops/irrigation/types";

/**
 * Get list of irrigations with filters and pagination
 */
export async function getIrrigations(
    params: GetIrrigationsParams = {}
): Promise<IrrigationApiResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.fieldId && params.fieldId !== "all") {
        queryParams.append("fieldId", params.fieldId);
    }
    if (params.irrigationDateFrom) {
        queryParams.append("irrigationDateFrom", params.irrigationDateFrom);
    }
    if (params.irrigationDateTo) {
        queryParams.append("irrigationDateTo", params.irrigationDateTo);
    }

    const response = await api.get<IrrigationApiResponse>(
        `/api/v1/irrigation?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single irrigation details by ID
 */
export async function getIrrigationDetails(
    irrigationId: string
): Promise<IrrigationRecord> {
    const response = await api.get<IrrigationDetailsResponse>(
        `/api/v1/irrigation/${irrigationId}`
    );

    const responseData = response.data?.data ?? response.data;
    const irrigationData = responseData?.irrigation;
    
    if (!irrigationData) {
        throw new Error("Irrigation data not found");
    }

    // Map backend fields to frontend structure
    return {
        id: irrigationData.id,
        fieldId: irrigationData.field?.id || irrigationData.fieldId || "",
        fieldName: irrigationData.field?.fieldName,
        irrigationDate: irrigationData.irrigationDate 
            ? (typeof irrigationData.irrigationDate === 'string' 
                ? irrigationData.irrigationDate 
                : new Date(irrigationData.irrigationDate).toISOString().split('T')[0])
            : "",
        irrigationMethod: irrigationData.irrigationMethod || null,
        waterVolume: irrigationData.waterVolume || null,
        volumeUnit: irrigationData.volumeUnit || null,
        durationMinutes: irrigationData.durationMinutes || null,
        cost: irrigationData.cost || null,
        notes: irrigationData.notes || null,
        createdAt: irrigationData.createdAt 
            ? (typeof irrigationData.createdAt === 'string' 
                ? irrigationData.createdAt 
                : new Date(irrigationData.createdAt).toISOString())
            : "",
        updatedAt: irrigationData.updatedAt 
            ? (typeof irrigationData.updatedAt === 'string' 
                ? irrigationData.updatedAt 
                : new Date(irrigationData.updatedAt).toISOString())
            : "",
    };
}

/**
 * Create a new irrigation record
 */
export async function createIrrigation(data: CreateIrrigationData): Promise<void> {
    const payload: any = {
        fieldId: data.fieldId,
        irrigationDate: data.irrigationDate,
        waterVolume: data.waterVolume || "",
        volumeUnit: data.volumeUnit || "",
        irrigationMethod: data.irrigationMethod || "",
        durationMinutes: data.durationMinutes || 0,
    };

    if (data.plantingRecordId) {
        payload.plantingRecordId = data.plantingRecordId;
    }
    if (data.cost !== undefined && data.cost !== null && data.cost !== "") {
        payload.cost = data.cost.toString();
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/irrigation", payload);
}

/**
 * Update an existing irrigation record
 */
export async function updateIrrigation(
    irrigationId: string,
    data: CreateIrrigationData
): Promise<void> {
    const payload: any = {
        fieldId: data.fieldId,
    };

    if (data.irrigationDate) {
        payload.irrigationDate = data.irrigationDate;
    }
    if (data.waterVolume !== undefined) {
        payload.waterVolume = data.waterVolume || null;
    }
    if (data.volumeUnit !== undefined) {
        payload.volumeUnit = data.volumeUnit || null;
    }
    if (data.irrigationMethod !== undefined) {
        payload.irrigationMethod = data.irrigationMethod || null;
    }
    if (data.durationMinutes !== undefined) {
        payload.durationMinutes = data.durationMinutes || null;
    }
    if (data.plantingRecordId !== undefined) {
        payload.plantingRecordId = data.plantingRecordId || null;
    }
    if (data.cost !== undefined) {
        payload.cost = data.cost !== null && data.cost !== "" ? data.cost.toString() : null;
    }
    if (data.notes !== undefined) {
        payload.notes = data.notes?.trim() || null;
    }

    await api.put(`/api/v1/irrigation/${irrigationId}`, payload);
}

/**
 * Delete an irrigation record
 */
export async function deleteIrrigation(irrigationId: string): Promise<void> {
    await api.delete(`/api/v1/irrigation/${irrigationId}`);
}
