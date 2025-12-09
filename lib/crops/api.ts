import { api } from "@/lib/api";
import type {
    PlantingsApiResponse,
    PlantingDetailsResponse,
    PlantingRecord,
    ApiPlantingResponse,
    PaginationInfo,
    SeedPurchaseRecord,
    SeedUsageRecord,
    GetPlantingsParams,
    CreatePlantingData,
    CreateSeedPurchaseData,
    CreateSeedUsageData,
} from "@/components/crops/types";

/**
 * Get list of plantings with filters and pagination
 */
export async function getPlantings(
    params: GetPlantingsParams = {}
): Promise<PlantingsApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.farmId) {
        queryParams.append("farmId", params.farmId);
    }
    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.search?.trim()) {
        queryParams.append("search", params.search.trim());
    }
    if (params.crop && params.crop !== "all") {
        queryParams.append("crop", params.crop);
    }
    if (params.fieldId && params.fieldId !== "all") {
        queryParams.append("fieldId", params.fieldId);
    }
    if (params.plantingDateFrom) {
        queryParams.append("plantingDateFrom", params.plantingDateFrom);
    }
    if (params.plantingDateTo) {
        queryParams.append("plantingDateTo", params.plantingDateTo);
    }

    const response = await api.get<PlantingsApiResponse>(
        `/api/v1/crops/plantings?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single planting details by ID
 */
export async function getPlantingDetails(
    plantingId: string
): Promise<PlantingRecord> {
    const response = await api.get<PlantingDetailsResponse>(
        `/api/v1/crops/plantings/${plantingId}`
    );

    const responseData = response.data?.data ?? response.data;
    const plantingData = responseData?.planting;
    
    if (!plantingData) {
        throw new Error("Planting data not found");
    }

    return {
        id: plantingData.id,
        fieldId: plantingData.fieldId,
        fieldName: plantingData.fieldName,
        crop: plantingData.crop,
        seedType: plantingData.seedType,
        plantingDate: plantingData.plantingDate,
        expectedHarvestDate: plantingData.expectedHarvestDate,
        quantityPlanted: plantingData.quantityPlanted,
        quantityUnit: plantingData.quantityUnit,
        seedCost: plantingData.seedCost,
        area: plantingData.area,
        areaUnit: plantingData.areaUnit,
        notes: plantingData.notes,
        isActive: plantingData.isActive,
        createdAt: plantingData.createdAt,
        updatedAt: plantingData.updatedAt,
    };
}

/**
 * Create a new planting record
 */
export async function createPlanting(data: CreatePlantingData): Promise<void> {
    const payload: any = {
        farmId: data.farmId,
        fieldId: data.fieldId,
        crop: data.crop,
        seedType: data.seedType,
        plantingDate: data.plantingDate,
    };

    if (data.expectedHarvestDate) {
        payload.expectedHarvestDate = data.expectedHarvestDate;
    }
    if (data.quantityPlanted !== undefined && data.quantityPlanted !== null) {
        payload.quantityPlanted = data.quantityPlanted;
    }
    if (data.quantityUnit) {
        payload.quantityUnit = data.quantityUnit;
    }
    if (data.seedCost !== undefined && data.seedCost !== null) {
        payload.seedCost = data.seedCost;
    }
    if (data.area !== undefined && data.area !== null) {
        payload.area = data.area;
    }
    if (data.areaUnit) {
        payload.areaUnit = data.areaUnit;
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/crops/plantings", payload);
}

/**
 * Update an existing planting record
 */
export async function updatePlanting(
    plantingId: string,
    data: CreatePlantingData
): Promise<void> {
    const payload: any = {
        farmId: data.farmId,
        fieldId: data.fieldId,
        crop: data.crop,
        seedType: data.seedType,
        plantingDate: data.plantingDate,
    };

    if (data.expectedHarvestDate) {
        payload.expectedHarvestDate = data.expectedHarvestDate;
    }
    if (data.quantityPlanted !== undefined && data.quantityPlanted !== null) {
        payload.quantityPlanted = data.quantityPlanted;
    }
    if (data.quantityUnit) {
        payload.quantityUnit = data.quantityUnit;
    }
    if (data.seedCost !== undefined && data.seedCost !== null) {
        payload.seedCost = data.seedCost;
    }
    if (data.area !== undefined && data.area !== null) {
        payload.area = data.area;
    }
    if (data.areaUnit) {
        payload.areaUnit = data.areaUnit;
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.put(`/api/v1/crops/plantings/${plantingId}`, payload);
}

/**
 * Delete a planting record
 */
export async function deletePlanting(plantingId: string): Promise<void> {
    await api.delete(`/api/v1/crops/plantings/${plantingId}`);
}

/**
 * Get seed purchase records
 */
export async function getSeedPurchases(params?: {
    page?: number;
    limit?: number;
    crop?: string;
    seedType?: string;
}): Promise<{ records: SeedPurchaseRecord[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.crop) queryParams.append("crop", params.crop);
    if (params?.seedType) queryParams.append("seedType", params.seedType);

    const response = await api.get<{
        message?: string;
        data?: {
            seedPurchases?: SeedPurchaseRecord[];
            pagination?: PaginationInfo;
        };
    }>(`/api/v1/crops/seed-purchases?${queryParams.toString()}`);
    
    const responseData = response.data?.data;
    const records = responseData?.seedPurchases ?? [];
    const pagination = responseData?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    };

    return {
        records: Array.isArray(records) ? records : [],
        pagination,
    };
}

/**
 * Create a seed purchase record
 */
export async function createSeedPurchase(
    data: CreateSeedPurchaseData
): Promise<void> {
    const payload: any = {
        seedType: data.seedType,
        crop: data.crop,
        purchaseDate: data.purchaseDate,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
    };

    if (data.cost !== undefined && data.cost !== null) {
        payload.cost = data.cost;
    }
    if (data.supplier?.trim()) {
        payload.supplier = data.supplier.trim();
    }
    if (data.batchNumber?.trim()) {
        payload.batchNumber = data.batchNumber.trim();
    }
    if (data.expiryDate) {
        payload.expiryDate = data.expiryDate;
    }
    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/crops/seed-purchases", payload);
}

/**
 * Get seed usage records
 */
export async function getSeedUsage(params?: {
    page?: number;
    limit?: number;
    plantingId?: string;
}): Promise<{ records: SeedUsageRecord[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.plantingId) queryParams.append("plantingId", params.plantingId);

    const response = await api.get<{
        message?: string;
        data?: {
            seedUsage?: SeedUsageRecord[];
            pagination?: PaginationInfo;
        };
    }>(`/api/v1/crops/seed-usage?${queryParams.toString()}`);
    
    const responseData = response.data?.data;
    const records = responseData?.seedUsage ?? [];
    const pagination = responseData?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    };

    return {
        records: Array.isArray(records) ? records : [],
        pagination,
    };
}

/**
 * Create a seed usage record
 */
export async function createSeedUsage(data: CreateSeedUsageData): Promise<void> {
    const payload: any = {
        seedType: data.seedType,
        crop: data.crop,
        plantingId: data.plantingId,
        usedDate: data.usedDate,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
    };

    if (data.notes?.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post("/api/v1/crops/seed-usage", payload);
}

