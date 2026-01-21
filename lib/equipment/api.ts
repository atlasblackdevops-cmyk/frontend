import { api } from "@/lib/api";

export interface Equipment {
    id: string;
    equipmentName: string;
    equipmentType: string | null;
    brand: string | null;
    model: string | null;
    serialNumber: string | null;
    purchaseDate: string | null;
    purchaseCost: string | null;
    photo: string | null;
    status: string;
    notes: string | null;
    lastServiceAt: string | null;
    createdAt: string;
    updatedAt: string;
    farm?: any;
    createdBy?: any;
    updatedBy?: any;
}

export interface MaintenanceLog {
    id: string;
    equipmentId: string;
    maintenanceDate: string;
    maintenanceType: string;
    description: string;
    cost: string | null;
    performedBy: string | null;
    nextMaintenanceDate: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    equipment?: Equipment;
    createdBy?: any;
    updatedBy?: any;
}

export interface EquipmentApiResponse {
    message?: string;
    data?: {
        equipment: Equipment[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface EquipmentDetailsResponse {
    message?: string;
    data?: {
        equipment: Equipment;
    };
}

export interface MaintenanceLogsApiResponse {
    message?: string;
    data?: {
        maintenanceLogs: MaintenanceLog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface MaintenanceLogDetailsResponse {
    message?: string;
    data?: {
        maintenanceLog: MaintenanceLog;
    };
}

export interface GetEquipmentParams {
    page?: number;
    limit?: number;
    search?: string;
    equipmentType?: string;
    status?: string;
}

export interface CreateEquipmentData {
    equipmentName: string;
    equipmentType?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    purchaseCost?: number;
    status?: string;
    notes?: string;
    photo?: File | null;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {}

export interface GetMaintenanceLogsParams {
    page?: number;
    limit?: number;
    equipmentId?: string;
    maintenanceType?: string;
    maintenanceDateFrom?: string;
    maintenanceDateTo?: string;
}

export interface CreateMaintenanceLogData {
    equipmentId: string;
    maintenanceDate: string;
    maintenanceType: string;
    description: string;
    cost?: number;
    performedBy?: string;
    nextMaintenanceDate?: string;
    notes?: string;
}

export interface UpdateMaintenanceLogData extends Partial<CreateMaintenanceLogData> {}

function buildEquipmentQueryParams(params: GetEquipmentParams = {}): URLSearchParams {
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
    if (params.equipmentType && params.equipmentType !== "all") {
        queryParams.append("equipmentType", params.equipmentType);
    }
    if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
    }

    return queryParams;
}

function buildEquipmentFormData(data: CreateEquipmentData | UpdateEquipmentData): FormData {
    const formData = new FormData();

    if (data.equipmentName !== undefined) {
        formData.append("equipmentName", data.equipmentName);
    }
    if (data.equipmentType !== undefined) {
        formData.append("equipmentType", data.equipmentType);
    }
    if (data.brand !== undefined) {
        formData.append("brand", data.brand);
    }
    if (data.model !== undefined) {
        formData.append("model", data.model);
    }
    if (data.serialNumber !== undefined) {
        formData.append("serialNumber", data.serialNumber);
    }
    if (data.purchaseDate !== undefined) {
        formData.append("purchaseDate", data.purchaseDate);
    }
    if (data.purchaseCost !== undefined && data.purchaseCost !== null) {
        formData.append("purchaseCost", data.purchaseCost.toString());
    }
    if (data.status !== undefined) {
        formData.append("status", data.status);
    }
    if (data.notes !== undefined) {
        formData.append("notes", data.notes);
    }
    if (data.photo) {
        formData.append("photo", data.photo);
    }

    return formData;
}

function buildMaintenanceLogsQueryParams(params: GetMaintenanceLogsParams = {}): URLSearchParams {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.equipmentId) {
        queryParams.append("equipmentId", params.equipmentId);
    }
    if (params.maintenanceType && params.maintenanceType !== "all") {
        queryParams.append("maintenanceType", params.maintenanceType);
    }
    if (params.maintenanceDateFrom) {
        queryParams.append("maintenanceDateFrom", params.maintenanceDateFrom);
    }
    if (params.maintenanceDateTo) {
        queryParams.append("maintenanceDateTo", params.maintenanceDateTo);
    }

    return queryParams;
}

// Equipment API functions
export async function getEquipment(
    params: GetEquipmentParams = {}
): Promise<EquipmentApiResponse> {
    const queryParams = buildEquipmentQueryParams(params);
    const response = await api.get<EquipmentApiResponse>(
        `/api/v1/equipment?${queryParams.toString()}`
    );
    return response.data;
}

export async function getEquipmentDetails(
    equipmentId: string
): Promise<Equipment> {
    const response = await api.get<EquipmentDetailsResponse>(
        `/api/v1/equipment/${equipmentId}`
    );

    const responseData = response.data?.data;
    const equipment = responseData?.equipment;

    if (!equipment) {
        throw new Error("Equipment not found");
    }

    return equipment;
}

export async function createEquipment(data: CreateEquipmentData): Promise<void> {
    const formData = buildEquipmentFormData(data);
    await api.post("/api/v1/equipment", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export async function updateEquipment(
    equipmentId: string,
    data: UpdateEquipmentData
): Promise<void> {
    const formData = buildEquipmentFormData(data);
    await api.put(`/api/v1/equipment/${equipmentId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export async function deleteEquipment(equipmentId: string): Promise<void> {
    await api.delete(`/api/v1/equipment/${equipmentId}`);
}

// Maintenance Logs API functions
export async function getMaintenanceLogs(
    params: GetMaintenanceLogsParams = {}
): Promise<MaintenanceLogsApiResponse> {
    const queryParams = buildMaintenanceLogsQueryParams(params);
    const response = await api.get<MaintenanceLogsApiResponse>(
        `/api/v1/equipment-maintenance?${queryParams.toString()}`
    );
    return response.data;
}

export async function getMaintenanceLogDetails(
    maintenanceLogId: string
): Promise<MaintenanceLog> {
    const response = await api.get<MaintenanceLogDetailsResponse>(
        `/api/v1/equipment-maintenance/${maintenanceLogId}`
    );

    const responseData = response.data?.data;
    const maintenanceLog = responseData?.maintenanceLog;

    if (!maintenanceLog) {
        throw new Error("Maintenance log not found");
    }

    return maintenanceLog;
}

export async function createMaintenanceLog(
    data: CreateMaintenanceLogData
): Promise<void> {
    await api.post("/api/v1/equipment-maintenance", data);
}

export async function updateMaintenanceLog(
    maintenanceLogId: string,
    data: UpdateMaintenanceLogData
): Promise<void> {
    await api.put(`/api/v1/equipment-maintenance/${maintenanceLogId}`, data);
}

export async function deleteMaintenanceLog(
    maintenanceLogId: string
): Promise<void> {
    await api.delete(`/api/v1/equipment-maintenance/${maintenanceLogId}`);
}

