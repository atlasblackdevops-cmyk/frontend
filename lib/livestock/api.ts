import { api } from "@/lib/api";
import type {
    AnimalsApiResponse,
    AnimalDetailsResponse,
    AnimalRecord,
    ApiAnimalResponse,
    HealthRecord,
    WeightRecord,
    FeedRecord,
    PaginationInfo,
    GroupsApiResponse,
    GroupDetailsResponse,
    GroupDashboardResponse,
    CreateGroupResponse,
    AddGroupValues,
    GroupMetrics,
    AssignAnimalsResponse,
    UpdateGroupValues,
    GroupAnimalsResponse,
    RemoveAnimalsResponse,
} from "@/components/livestock/types";

export interface GetAnimalsParams {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
    birthdateFrom?: string;
    birthdateTo?: string;
}

export interface CreateAnimalData {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthdate: string;
    photo: File | null;
}

export interface CreateHealthRecordData {
    recordType: string;
    name: string;
    cost?: number;
    nextDueDate?: string;
    description?: string;
    images?: File[]; // Array of image files for upload
}

export interface UpdateHealthRecordData
    extends Partial<CreateHealthRecordData> {
    deletedImageKeys?: string[]; // Array of image keys to delete (only for updates)
}

export interface CreateWeightRecordData {
    measuredAt: string;
    weight: number;
    weightUnit: string;
    notes?: string;
}

export interface CreateFeedRecordData {
    quantity: number;
    quantityUnit: string;
    feedType: string;
    notes?: string;
}

/**
 * Get list of animals with filters and pagination
 */
export async function getAnimals(
    params: GetAnimalsParams = {}
): Promise<AnimalsApiResponse> {
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
    if (params.gender && params.gender !== "all") {
        queryParams.append("gender", params.gender);
    }
    if (params.birthdateFrom) {
        queryParams.append("birthdateFrom", params.birthdateFrom);
    }
    if (params.birthdateTo) {
        queryParams.append("birthdateTo", params.birthdateTo);
    }

    const response = await api.get<AnimalsApiResponse>(
        `/api/v1/animals?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single animal details by ID
 */
export async function getAnimalDetails(
    animalId: string
): Promise<AnimalRecord> {
    const response = await api.get<AnimalDetailsResponse>(
        `/api/v1/animals/${animalId}`
    );

    const responseData = response.data?.data ?? response.data;
    const animalData = responseData?.animal;

    if (!animalData) {
        throw new Error("Animal data not found");
    }

    return {
        id: animalData.id,
        name: animalData.name,
        species: animalData.species,
        breed: animalData.breed,
        gender: animalData.gender as "Male" | "Female" | "Unknown",
        birthdate: animalData.birthdate,
        photo: animalData.photo,
        isActive: animalData.isActive,
        createdAt: animalData.createdAt,
        updatedAt: animalData.updatedAt,
    };
}

/**
 * Create a new animal
 */
export async function createAnimal(data: CreateAnimalData): Promise<void> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("species", data.species);
    formData.append("breed", data.breed);
    formData.append("gender", data.gender);
    formData.append("birthdate", data.birthdate);

    if (data.photo) {
        formData.append("image", data.photo);
    }

    await api.post("/api/v1/animals", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 * Update an existing animal
 */
export async function updateAnimal(
    animalId: string,
    data: CreateAnimalData
): Promise<void> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("species", data.species);
    formData.append("breed", data.breed);
    formData.append("gender", data.gender);
    formData.append("birthdate", data.birthdate);

    if (data.photo) {
        formData.append("image", data.photo);
    }

    await api.put(`/api/v1/animals/${animalId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 * Delete an animal
 */
export async function deleteAnimal(animalId: string): Promise<void> {
    await api.delete(`/api/v1/animals/${animalId}`);
}

/**
 * Get health records for an animal with pagination and date filters
 */
export async function getHealthRecords(
    animalId: string,
    params?: {
        page?: number;
        limit?: number;
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<{ records: HealthRecord[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);

    const response = await api.get<{
        message?: string;
        data?: {
            healthRecords?: HealthRecord[];
            pagination?: PaginationInfo;
        };
    }>(`/api/v1/animals/${animalId}/health-records?${queryParams.toString()}`);

    const responseData = response.data?.data;
    const records = responseData?.healthRecords ?? [];
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
 * Create a health record for an animal
 */
export async function createHealthRecord(
    animalId: string,
    data: CreateHealthRecordData
): Promise<void> {
    // Always use FormData for multipart/form-data as per API spec
    const formData = new FormData();
    formData.append("recordType", data.recordType);
    formData.append("name", data.name);

    if (data.cost !== null && data.cost !== undefined) {
        formData.append("cost", data.cost.toString());
    }
    if (data.nextDueDate) {
        formData.append("nextDueDate", data.nextDueDate);
    }
    if (data.description) {
        formData.append("description", data.description);
    }

    // Append images if provided
    if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
            formData.append("images", image);
        });
    }

    await api.post(`/api/v1/animals/${animalId}/health-records`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

/**
 * Update a health record
 */
export async function updateHealthRecord(
    animalId: string,
    recordId: string,
    data: UpdateHealthRecordData
): Promise<void> {
    // Always use FormData for multipart/form-data as per API spec
    const formData = new FormData();

    // All fields are optional for update
    if (data.recordType) {
        formData.append("recordType", data.recordType);
    }
    if (data.name) {
        formData.append("name", data.name);
    }
    if (data.cost !== null && data.cost !== undefined) {
        formData.append("cost", data.cost.toString());
    }
    if (data.nextDueDate) {
        formData.append("nextDueDate", data.nextDueDate);
    }
    if (data.description) {
        formData.append("description", data.description);
    }

    // Append images if provided (adds new images)
    if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
            formData.append("images", image);
        });
    }

    // Append deletedImageKeys if provided (deletes specific images by S3 key)
    if (data.deletedImageKeys && data.deletedImageKeys.length > 0) {
        // Send as JSON array string or multiple entries
        // Backend should parse this as array of strings
        data.deletedImageKeys.forEach((key) => {
            formData.append("deletedImageKeys", key);
        });
    }

    await api.put(
        `/api/v1/animals/${animalId}/health-records/${recordId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
}

/**
 * Get weight records for an animal with pagination and date filters
 */
export async function getWeightRecords(
    animalId: string,
    params?: {
        page?: number;
        limit?: number;
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<{ records: WeightRecord[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);

    const response = await api.get<{
        message?: string;
        data?: {
            weightRecords?: WeightRecord[];
            pagination?: PaginationInfo;
        };
    }>(`/api/v1/animals/${animalId}/weight-records?${queryParams.toString()}`);

    const responseData = response.data?.data;
    const records = responseData?.weightRecords ?? [];
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
 * Create a weight record for an animal
 */
export async function createWeightRecord(
    animalId: string,
    data: CreateWeightRecordData
): Promise<void> {
    // Convert date string to ISO format
    const measuredAtDate = new Date(data.measuredAt);
    const measuredAtISO = measuredAtDate.toISOString();

    const payload: {
        measuredAt: string;
        weight: number;
        weightUnit: string;
        notes?: string;
    } = {
        measuredAt: measuredAtISO,
        weight: data.weight,
        weightUnit: data.weightUnit,
    };

    if (data.notes && data.notes.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post(`/api/v1/animals/${animalId}/weight-records`, payload);
}

/**
 * Update a weight record
 */
export async function updateWeightRecord(
    animalId: string,
    recordId: string,
    data: CreateWeightRecordData
): Promise<void> {
    // Convert date string to ISO format
    const measuredAtDate = new Date(data.measuredAt);
    const measuredAtISO = measuredAtDate.toISOString();

    const payload: {
        measuredAt: string;
        weight: number;
        weightUnit: string;
        notes?: string;
    } = {
        measuredAt: measuredAtISO,
        weight: data.weight,
        weightUnit: data.weightUnit,
    };

    if (data.notes && data.notes.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.put(
        `/api/v1/animals/${animalId}/weight-records/${recordId}`,
        payload
    );
}

/**
 * Get feed records for an animal with pagination and date filters
 */
export async function getFeedRecords(
    animalId: string,
    params?: {
        page?: number;
        limit?: number;
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<{ records: FeedRecord[]; pagination: PaginationInfo }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);

    const response = await api.get<{
        message?: string;
        data?: {
            feedRecords?: FeedRecord[];
            pagination?: PaginationInfo;
        };
    }>(`/api/v1/animals/${animalId}/feed-records?${queryParams.toString()}`);

    const responseData = response.data?.data;
    const records = responseData?.feedRecords ?? [];
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
 * Create a feed record for an animal
 */
export async function createFeedRecord(
    animalId: string,
    data: CreateFeedRecordData
): Promise<void> {
    const payload: {
        quantity: number;
        quantityUnit: string;
        feedType: string;
        notes?: string;
    } = {
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        feedType: data.feedType,
    };

    if (data.notes && data.notes.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.post(`/api/v1/animals/${animalId}/feed-records`, payload);
}

/**
 * Update a feed record
 */
export async function updateFeedRecord(
    animalId: string,
    recordId: string,
    data: CreateFeedRecordData
): Promise<void> {
    const payload: {
        quantity: number;
        quantityUnit: string;
        feedType: string;
        notes?: string;
    } = {
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        feedType: data.feedType,
    };

    if (data.notes && data.notes.trim()) {
        payload.notes = data.notes.trim();
    }

    await api.put(
        `/api/v1/animals/${animalId}/feed-records/${recordId}`,
        payload
    );
}

/**
 * Dashboard stats API response
 */
export interface DashboardStatsResponse {
    message: string;
    data: {
        totalAnimals: number;
        averageWeight: number;
        totalWeightRecords: number;
        vaccinationCompliance: number;
    };
}

/**
 * Weight trends API response
 */
export interface WeightTrendsResponse {
    message: string;
    data: {
        weightTrends: Array<{
            date: string; // Format: "YYYY-MM"
            averageWeight: number; // in kg
            count: number; // number of records in that month
        }>;
    };
}

/**
 * Get dashboard statistics for livestock
 */
export async function getDashboardStats(): Promise<
    DashboardStatsResponse["data"]
> {
    const response = await api.get<DashboardStatsResponse>(
        "/api/v1/animals/dashboard"
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Dashboard data not found");
    }

    return responseData;
}

/**
 * Get weight trends for livestock dashboard
 */
export async function getWeightTrends(): Promise<
    WeightTrendsResponse["data"]["weightTrends"]
> {
    const response = await api.get<WeightTrendsResponse>(
        "/api/v1/animals/dashboard/weight-trends"
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData || !responseData.weightTrends) {
        throw new Error("Weight trends data not found");
    }

    return responseData.weightTrends;
}

/**
 * Feed trends API response
 */
export interface FeedTrendsResponse {
    message: string;
    data: {
        feedEntriesTrends: Array<{
            date: string; // Format: "YYYY-MM"
            totalQuantity: number; // in kg
            count: number; // number of feed entries in that month
        }>;
    };
}

/**
 * Get feed trends for livestock dashboard
 */
export async function getFeedTrends(): Promise<
    FeedTrendsResponse["data"]["feedEntriesTrends"]
> {
    const response = await api.get<FeedTrendsResponse>(
        "/api/v1/animals/dashboard/feed-trends"
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData || !responseData.feedEntriesTrends) {
        throw new Error("Feed trends data not found");
    }

    return responseData.feedEntriesTrends;
}

/**
 * Animal Groups API
 */

export interface GetGroupsParams {
    page?: number;
    limit?: number;
    search?: string;
}

/**
 * Get dashboard metrics for animal groups
 */
export async function getGroupsDashboard(): Promise<GroupMetrics> {
    const response = await api.get<GroupDashboardResponse>(
        "/api/v1/animals/groups/dashboard"
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Groups dashboard data not found");
    }

    return responseData;
}

/**
 * Get all animal groups with pagination and search
 */
export async function getGroups(
    params: GetGroupsParams = {}
): Promise<GroupsApiResponse> {
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

    const response = await api.get<GroupsApiResponse>(
        `/api/v1/animals/groups?${queryParams.toString()}`
    );

    return response.data;
}

/**
 * Get single group details with animals
 */
export async function getGroupDetails(
    groupId: string
): Promise<GroupDetailsResponse["data"]> {
    const response = await api.get<GroupDetailsResponse>(
        `/api/v1/animals/groups/${groupId}`
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Group data not found");
    }

    return responseData;
}

/**
 * Create a new animal group
 */
export async function createGroup(
    data: AddGroupValues
): Promise<CreateGroupResponse["data"]> {
    const payload: {
        name: string;
        description?: string;
    } = {
        name: data.name.trim(),
    };

    if (data.description && data.description.trim()) {
        payload.description = data.description.trim();
    }

    const response = await api.post<CreateGroupResponse>(
        "/api/v1/animals/groups",
        payload
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Group creation failed");
    }

    return responseData;
}

/**
 * Update an animal group
 */
export async function updateGroup(
    groupId: string,
    data: UpdateGroupValues
): Promise<CreateGroupResponse["data"]> {
    const payload: {
        name?: string;
        description?: string;
    } = {};

    if (data.name !== undefined) {
        payload.name = data.name.trim();
    }
    if (data.description !== undefined) {
        const trimmed = data.description.trim();
        payload.description = trimmed || undefined;
    }

    const response = await api.put<CreateGroupResponse>(
        `/api/v1/animals/groups/${groupId}`,
        payload
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Group update failed");
    }

    return responseData;
}

/**
 * Delete an animal group
 */
export async function deleteGroup(groupId: string): Promise<void> {
    await api.delete(`/api/v1/animals/groups/${groupId}`);
}

/**
 * Assign animals to a group
 */
export async function assignAnimalsToGroup(
    groupId: string,
    animalIds: string[]
): Promise<AssignAnimalsResponse["data"]> {
    const payload = {
        animalIds: animalIds,
    };

    const response = await api.post<AssignAnimalsResponse>(
        `/api/v1/animals/groups/${groupId}/animals`,
        payload
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Failed to assign animals");
    }

    return responseData;
}

/**
 * Get animals in a group with pagination and search
 */
export async function getGroupAnimals(
    groupId: string,
    params?: {
        page?: number;
        limit?: number;
        search?: string;
    }
): Promise<GroupAnimalsResponse["data"]> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params?.search?.trim()) {
        queryParams.append("search", params.search.trim());
    }

    const response = await api.get<GroupAnimalsResponse>(
        `/api/v1/animals/groups/${groupId}/animals?${queryParams.toString()}`
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Group animals data not found");
    }

    return responseData;
}

/**
 * Remove animals from a group
 * DELETE /api/v1/animals/groups/{groupId}/animals
 */
export async function removeAnimalsFromGroup(
    groupId: string,
    animalIds: string[]
): Promise<RemoveAnimalsResponse["data"]> {
    const payload = {
        animalIds: animalIds,
    };

    const response = await api.delete<RemoveAnimalsResponse>(
        `/api/v1/animals/groups/${groupId}/animals`,
        { data: payload }
    );

    const responseData = response.data?.data ?? response.data;

    if (!responseData) {
        throw new Error("Failed to remove animals");
    }

    return responseData;
}
