export type AnimalRecord = {
    id: string;
    name: string;
    species: string;
    breed: string;
    gender: "Male" | "Female" | "Unknown";
    birthdate: string;
    photo: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ApiAnimalResponse = {
    id: string;
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthdate: string;
    photo: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
    updatedBy?: {
        id: string;
        name: string;
        email: string;
    };
};

export type AnimalsApiResponse = {
    message: string;
    data: {
        animals: ApiAnimalResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type AnimalDetailsResponse = {
    message: string;
    data: {
        animal: ApiAnimalResponse;
    };
};

export type AddAnimalValues = {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birthdate: string;
    photo: File | null;
};

export type HealthRecord = {
    id: string;
    recordType: string;
    name: string;
    cost: number | null;
    nextDueDate: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
};

export type WeightRecord = {
    id: string;
    measuredAt: string;
    weight: number;
    weightUnit: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
};

export type FeedRecord = {
    id: string;
    quantity: number;
    quantityUnit: string;
    feedType: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
};

export type HealthRecordValues = {
    type: string;
    name: string;
    cost: number | "";
    nextDueDate: string;
    description: string;
};

export type WeightRecordValues = {
    measuredAt: string;
    weight: number | "";
    weightUnit: string;
    notes: string;
};

export type FeedRecordValues = {
    quantity: number | "";
    quantityUnit: string;
    feedType: string;
    notes: string;
};

export type FilterValues = {
    search: string;
    gender: string;
    birthdateFrom: string;
    birthdateTo: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export const GENDER_OPTIONS = [
    { value: "all", label: "All" },
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Unknown", label: "Unknown" },
] as const;

