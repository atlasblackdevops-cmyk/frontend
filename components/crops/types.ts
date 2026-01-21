export type PlantingRecord = {
    id: string;
    fieldId: string;
    fieldName?: string; // For display purposes
    crop: string;
    seedType: string;
    plantingDate: string;
    expectedHarvestDate?: string | null;
    quantityPlanted?: number | null;
    quantityUnit?: string | null;
    seedCost?: number | null;
    area?: number | null;
    areaUnit?: string | null;
    notes?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ApiPlantingResponse = {
    id: string;
    fieldId: string;
    fieldName?: string;
    crop: string;
    seedType: string;
    plantingDate: string;
    expectedHarvestDate?: string | null;
    quantityPlanted?: number | null;
    quantityUnit?: string | null;
    seedCost?: number | null;
    area?: number | null;
    areaUnit?: string | null;
    notes?: string | null;
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

export type PlantingsApiResponse = {
    message: string;
    data: {
        plantings: ApiPlantingResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type PlantingDetailsResponse = {
    message: string;
    data: {
        planting: ApiPlantingResponse;
    };
};

export type AddPlantingValues = {
    fieldId: string;
    crop: string;
    seedType: string;
    plantingDate: string;
    expectedHarvestDate?: string;
    quantityPlanted?: number | "";
    quantityUnit?: string;
    seedCost?: number | "";
    area?: number | "";
    areaUnit?: string;
    notes?: string;
};

export type SeedPurchaseRecord = {
    id: string;
    seedType: string;
    crop: string;
    purchaseDate: string;
    quantity: number;
    quantityUnit: string;
    cost: number | null;
    supplier?: string | null;
    batchNumber?: string | null;
    expiryDate?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type SeedUsageRecord = {
    id: string;
    seedType: string;
    crop: string;
    plantingId: string;
    usedDate: string;
    quantity: number;
    quantityUnit: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type FilterValues = {
    search: string;
    crop: string;
    fieldId: string;
    plantingDateFrom: string;
    plantingDateTo: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export const CROP_OPTIONS = [
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

export const AREA_UNIT_OPTIONS = [
    { value: "", label: "None" },
    { value: "acres", label: "Acres" },
    { value: "hectares", label: "Hectares" },
    { value: "square_meters", label: "Square Meters" },
    { value: "square_feet", label: "Square Feet" },
] as const;

export const QUANTITY_UNIT_OPTIONS = [
    { value: "", label: "None" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "grams", label: "Grams" },
    { value: "seeds", label: "Seeds" },
    { value: "bags", label: "Bags" },
] as const;

// API Parameter Types
export interface GetPlantingsParams {
    farmId?: string;
    page?: number;
    limit?: number;
    search?: string;
    crop?: string;
    fieldId?: string;
    plantingDateFrom?: string;
    plantingDateTo?: string;
}

export interface CreatePlantingData {
    farmId?: string;
    fieldId: string;
    crop: string;
    seedType: string;
    plantingDate: string;
    expectedHarvestDate?: string;
    quantityPlanted?: number;
    quantityUnit?: string;
    seedCost?: number;
    area?: number;
    areaUnit?: string;
    notes?: string;
}

export interface CreateSeedPurchaseData {
    seedType: string;
    crop: string;
    purchaseDate: string;
    quantity: number;
    quantityUnit: string;
    cost?: number;
    supplier?: string;
    batchNumber?: string;
    expiryDate?: string;
    notes?: string;
}

export interface CreateSeedUsageData {
    seedType: string;
    crop: string;
    plantingId: string;
    usedDate: string;
    quantity: number;
    quantityUnit: string;
    notes?: string;
}

// Component Prop Types
export interface PlantingModalProps {
    mode: "create" | "update";
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddPlantingValues) => Promise<void>;
    isSubmitting: boolean;
    planting?: PlantingRecord | null;
}

export interface PlantingTableProps {
    plantings: PlantingRecord[];
    pagination?: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (planting: PlantingRecord) => void;
    onDelete: (planting: PlantingRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface PlantingFiltersProps {
    onOpenFilters: () => void;
}

export interface PlantingFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

// Planting Statistics Types
export interface PlantingSummary {
    totalActivePlantings: number;
    totalFieldsWithPlantings: number;
    totalFields: number;
    totalFieldsWithoutPlantings: number;
    totalAreaPlanted: number;
    uniqueCrops: number;
    upcomingHarvestsCount: number;
}

export interface PlantingByField {
    fieldId: string;
    fieldName: string;
    fieldSize: number;
    sizeUnit: string;
    plantings: Array<{
        id: string;
        cropName: string;
        seedType: string;
        plantingDate: string;
        expectedHarvestDate: string;
        quantityPlanted: number;
        quantityUnit: string;
        area: number;
        areaUnit: string;
    }>;
}

export interface FieldWithoutPlanting {
    fieldId: string;
    fieldName: string;
    fieldSize: number;
    sizeUnit: string;
}

export interface CropBreakdown {
    cropName: string;
    plantingCount: number;
    totalArea: number;
    fieldsCount: number;
}

export interface UpcomingHarvest {
    id: string;
    cropName: string;
    fieldName: string;
    expectedHarvestDate: string;
    daysUntilHarvest: number;
}

export interface PlantingStatisticsData {
    summary: PlantingSummary;
    plantingsByField: PlantingByField[];
    fieldsWithNoActivePlantings: FieldWithoutPlanting[];
    cropBreakdown: CropBreakdown[];
    upcomingHarvests: UpcomingHarvest[];
}

export interface PlantingStatisticsResponse {
    message: string;
    data: PlantingStatisticsData;
}

