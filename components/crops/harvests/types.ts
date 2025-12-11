export type HarvestRecord = {
    id: string;
    fieldId: string;
    fieldName?: string; // For display purposes
    harvestDate: string;
    yieldAmount: number;
    yieldUnit: string;
    cropType: string;
    notes?: string | null;
    plantingRecordId?: string | null;
    plantingRecord?: {
        id: string;
        crop: string;
        plantingDate: string;
    } | null;
    createdAt: string;
    updatedAt: string;
};

export type ApiHarvestResponse = {
    id: string;
    harvestDate: string;
    cropType: string;
    yieldAmount: string; // API returns as string
    yieldUnit: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    field: {
        id: string;
        fieldName: string;
    };
    plantingRecord?: {
        id?: string;
        crop?: string;
        plantingDate?: string;
        [key: string]: any; // Allow other fields
    } | null;
    createdBy?: {
        id?: string;
        name?: string;
        email?: string;
        [key: string]: any;
    };
    updatedBy?: {
        id?: string;
        name?: string;
        email?: string;
        [key: string]: any;
    };
};

export type HarvestsApiResponse = {
    message: string;
    data: {
        harvests: ApiHarvestResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type HarvestDetailsResponse = {
    message: string;
    data: {
        harvest: ApiHarvestResponse;
    };
};

export type YieldBySeasonResponse = {
    message: string;
    data: {
        yields: Array<{
            season: string; // e.g., "2024 Spring", "2024 Fall"
            yieldAmount: number;
            yieldUnit: string;
            cropType: string;
        }>;
    };
};

export type AddHarvestValues = {
    fieldId: string;
    harvestDate: string;
    yieldAmount: number | "";
    yieldUnit: string;
    cropType: string;
    notes?: string;
    plantingRecordId?: string;
};

export type FilterValues = {
    search: string;
    cropType: string;
    fieldId: string;
    harvestDateFrom: string;
    harvestDateTo: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

// API Parameter Types
export interface GetHarvestsParams {
    page?: number;
    limit?: number;
    search?: string;
    cropType?: string;
    fieldId?: string;
    harvestDateFrom?: string;
    harvestDateTo?: string;
}

export interface CreateHarvestData {
    fieldId: string;
    harvestDate: string;
    yieldAmount: number;
    yieldUnit: string;
    cropType: string;
    notes?: string;
    plantingRecordId?: string;
}

// Component Prop Types
export interface HarvestModalProps {
    mode: "create" | "update";
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddHarvestValues) => Promise<void>;
    isSubmitting: boolean;
    harvest?: HarvestRecord | null;
}

export interface HarvestTableProps {
    harvests: HarvestRecord[];
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (harvest: HarvestRecord) => void;
    onDelete: (harvest: HarvestRecord) => void;
}

export interface HarvestFiltersProps {
    onOpenFilters: () => void;
}

export interface HarvestFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export interface YieldBySeasonChartProps {
    data: Array<{
        season: string;
        yieldAmount: number;
        yieldUnit: string;
        cropType: string;
    }>;
    isLoading?: boolean;
}

export const YIELD_UNIT_OPTIONS = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "tons", label: "Tons" },
    { value: "bushels", label: "Bushels" },
    { value: "bags", label: "Bags" },
] as const;

export const CROP_TYPE_OPTIONS = [
    { value: "all", label: "All Crops" },
    { value: "Corn", label: "Corn" },
    { value: "Wheat", label: "Wheat" },
    { value: "Rice", label: "Rice" },
    { value: "Soybean", label: "Soybean" },
    { value: "Barley", label: "Barley" },
    { value: "Oats", label: "Oats" },
    { value: "Cotton", label: "Cotton" },
    { value: "Potato", label: "Potato" },
    { value: "Tomato", label: "Tomato" },
    { value: "Other", label: "Other" },
] as const;
