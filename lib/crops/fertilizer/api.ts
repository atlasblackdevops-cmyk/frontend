import { api } from "@/lib/api";
import type {
    FertilizerApiResponse,
    FertilizerDetailsResponse,
    FertilizerRecord,
    ApiFertilizerResponse,
    GetFertilizersParams,
    CreateFertilizerData,
} from "@/components/crops/fertilizer/types";

/**
 * Get list of fertilizers with filters and pagination
 */
export async function getFertilizers(
    params: GetFertilizersParams = {}
): Promise<FertilizerApiResponse> {
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
    if (params.applicationDateFrom) {
        queryParams.append("applicationDateFrom", params.applicationDateFrom);
    }
    if (params.applicationDateTo) {
        queryParams.append("applicationDateTo", params.applicationDateTo);
    }

    const response = await api.get<FertilizerApiResponse>(
        `/api/v1/fertilizer?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single fertilizer details by ID
 */
export async function getFertilizerDetails(
    fertilizerId: string
): Promise<FertilizerRecord> {
    const response = await api.get<FertilizerDetailsResponse>(
        `/api/v1/fertilizer/${fertilizerId}`
    );

    const responseData = response.data?.data ?? response.data;
    const fertilizerData = responseData?.fertilizer;
    
    if (!fertilizerData) {
        throw new Error("Fertilizer data not found");
    }

    // Map backend fields to frontend structure
    return {
        id: fertilizerData.id,
        fieldId: fertilizerData.field?.id || fertilizerData.fieldId || "",
        fieldName: fertilizerData.field?.fieldName,
        applicationDate: fertilizerData.applicationDate 
            ? (typeof fertilizerData.applicationDate === 'string' 
                ? fertilizerData.applicationDate 
                : new Date(fertilizerData.applicationDate).toISOString().split('T')[0])
            : "",
        fertilizerType: fertilizerData.fertilizerType || null,
        quantity: fertilizerData.quantity || null,
        quantityUnit: fertilizerData.quantityUnit || null,
        applicationMethod: fertilizerData.applicationMethod || null,
        cost: fertilizerData.cost || null,
        notes: fertilizerData.notes || null,
        createdAt: fertilizerData.createdAt 
            ? (typeof fertilizerData.createdAt === 'string' 
                ? fertilizerData.createdAt 
                : new Date(fertilizerData.createdAt).toISOString())
            : "",
        updatedAt: fertilizerData.updatedAt 
            ? (typeof fertilizerData.updatedAt === 'string' 
                ? fertilizerData.updatedAt 
                : new Date(fertilizerData.updatedAt).toISOString())
            : "",
    };
}

/**
 * Create a new fertilizer record
 */
export async function createFertilizer(data: CreateFertilizerData): Promise<void> {
    // All fields are required for create except applicationMethod and notes
    const payload: any = {
        fieldId: data.fieldId,
        fertilizerType: data.fertilizerType || "",
        quantity: data.quantity || "",
        quantityUnit: data.quantityUnit || "",
        applicationDate: data.applicationDate || "",
        cost: data.cost || "",
    };

    if (data.applicationMethod?.trim()) {
        payload.applicationMethod = data.applicationMethod.trim();
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/fertilizer", payload);
}

/**
 * Update an existing fertilizer record
 */
export async function updateFertilizer(
    fertilizerId: string,
    data: CreateFertilizerData
): Promise<void> {
    const payload: any = {};

    if (data.fieldId) {
        payload.fieldId = data.fieldId;
    }
    if (data.applicationDate) {
        payload.applicationDate = data.applicationDate;
    }
    if (data.fertilizerType !== undefined) {
        payload.fertilizerType = data.fertilizerType || null;
    }
    if (data.quantity !== undefined) {
        payload.quantity = data.quantity || null;
    }
    if (data.quantityUnit !== undefined) {
        payload.quantityUnit = data.quantityUnit || null;
    }
    if (data.applicationMethod !== undefined) {
        payload.applicationMethod = data.applicationMethod || null;
    }
    if (data.cost !== undefined) {
        payload.cost = data.cost !== null && data.cost !== "" ? data.cost.toString() : null;
    }
    if (data.notes !== undefined) {
        payload.notes = data.notes?.trim() || null;
    }

    await api.put(`/api/v1/fertilizer/${fertilizerId}`, payload);
}

/**
 * Delete a fertilizer record
 */
export async function deleteFertilizer(fertilizerId: string): Promise<void> {
    await api.delete(`/api/v1/fertilizer/${fertilizerId}`);
}

