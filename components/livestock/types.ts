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
    speciesRelation: {
        id: string;
        name: string;
    };
    breedRelation: {
        id: string;
        name: string;
    };
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

export type HealthRecordImage = {
    id: string;
    imageKey: string;
    imageUrl: string;
};

export type HealthRecord = {
    id: string;
    recordType: string;
    name: string;
    cost: number | string | null;
    nextDueDate: string | null;
    description: string | null;
    images?: HealthRecordImage[]; // Array of image objects from API
    createdAt: string;
    updatedAt: string;
};

export type WeightRecord = {
    id: string;
    measuredAt: string;
    weight: number | string;
    weightUnit: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
};

export type FeedRecord = {
    id: string;
    quantity: number | string;
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
    images?: File[]; // Array of image files for upload
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

// Animal Groups Types
export type AnimalGroup = {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    animalCount: number;
    averageWeight: number | null;
    averageAge: string | number | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        email: string;
    };
    updatedBy?: {
        id: string;
        email: string;
    };
};

export type AnimalGroupAssignment = {
    id: string;
    animal: AnimalRecord;
    assignedAt: string;
};

export type AnimalGroupWithAnimals = AnimalGroup & {
    animals: AnimalGroupAssignment[];
};

export type GroupMetrics = {
    totalGroups: number;
    animalsInGroups: number;
    averageGroupSize: number;
    averageWeight: number | null;
    averageAge: string | number | null;
    groupDistribution: number;
};

export type AddGroupValues = {
    name: string;
    description: string;
};

export type AssignAnimalsValues = {
    animalIds: string[];
};

export type GroupsApiResponse = {
    message: string;
    data: {
        groups: AnimalGroup[];
        pagination: PaginationInfo;
    };
};

export type GroupDetailsResponse = {
    message: string;
    data: AnimalGroupWithAnimals;
};

export type GroupDashboardResponse = {
    message: string;
    data: GroupMetrics;
};

export type CreateGroupResponse = {
    message: string;
    data: {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

export type AssignAnimalsResponse = {
    message: string;
    data: {
        assigned: number;
        alreadyAssigned: number;
        total: number;
    };
};

export type UpdateGroupValues = {
    name?: string;
    description?: string;
};

export type GroupAnimalsResponse = {
    message: string;
    data: {
        animals: AnimalGroupAssignment[];
        pagination: PaginationInfo;
    };
};

export type RemoveAnimalsResponse = {
    message: string;
    data: {
        removed: number;
        requested: number;
    };
};

// Component Prop Types
export interface AnimalFiltersProps {
    onOpenFilters: () => void;
    activeFiltersCount?: number;
}

export interface AnimalFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export interface AnimalTableProps {
    animals: AnimalRecord[];
    pagination: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (animal: AnimalRecord) => void;
    onDelete: (animal: AnimalRecord) => void;
    onOpenHealthRecords: (animal: AnimalRecord) => void;
    onOpenWeightRecords: (animal: AnimalRecord) => void;
    onOpenFeedRecords: (animal: AnimalRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface GroupsTableProps {
    groups: AnimalGroup[];
    pagination?: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (group: AnimalGroup) => void;
    onDelete: (group: AnimalGroup) => void;
    onAssignAnimals: (group: AnimalGroup) => void;
    onPageChange?: (page: number) => void;
}
