import { api } from "@/lib/api";
import type {
    AnimalsApiResponse,
    AnimalDetailsResponse,
    AnimalRecord,
    ApiAnimalResponse,
    HealthRecord,
    WeightRecord,
    FeedRecord,
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
 * Get health records for an animal
 */
export async function getHealthRecords(
    animalId: string
): Promise<HealthRecord[]> {
    const response = await api.get(
        `/api/v1/animals/${animalId}/health-records`
    );
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
}

/**
 * Create a health record for an animal
 */
export async function createHealthRecord(
    animalId: string,
    data: CreateHealthRecordData
): Promise<void> {
    const payload: {
        recordType: string;
        name: string;
        cost?: number;
        nextDueDate?: string;
        description?: string;
    } = {
        recordType: data.recordType,
        name: data.name,
    };

    if (data.cost !== null && data.cost !== undefined) {
        payload.cost = data.cost;
    }
    if (data.nextDueDate) {
        payload.nextDueDate = data.nextDueDate;
    }
    if (data.description) {
        payload.description = data.description;
    }

    await api.post(`/api/v1/animals/${animalId}/health-records`, payload);
}

/**
 * Update a health record
 */
export async function updateHealthRecord(
    animalId: string,
    recordId: string,
    data: CreateHealthRecordData
): Promise<void> {
    const payload: {
        recordType: string;
        name: string;
        cost?: number;
        nextDueDate?: string;
        description?: string;
    } = {
        recordType: data.recordType,
        name: data.name,
    };

    if (data.cost !== null && data.cost !== undefined) {
        payload.cost = data.cost;
    }
    if (data.nextDueDate) {
        payload.nextDueDate = data.nextDueDate;
    }
    if (data.description) {
        payload.description = data.description;
    }

    await api.put(
        `/api/v1/animals/${animalId}/health-records/${recordId}`,
        payload
    );
}

/**
 * Get weight records for an animal
 */
export async function getWeightRecords(
    animalId: string
): Promise<WeightRecord[]> {
    const response = await api.get(
        `/api/v1/animals/${animalId}/weight-records`
    );
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
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
 * Get feed records for an animal
 */
export async function getFeedRecords(animalId: string): Promise<FeedRecord[]> {
    const response = await api.get(
        `/api/v1/animals/${animalId}/feed-records`
    );
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
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

