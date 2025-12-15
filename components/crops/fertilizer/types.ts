export type FertilizerRecord = {
    id: string;
    fieldId: string;
    fieldName?: string;
    applicationDate: string;
    fertilizerType?: string | null;
    quantity?: string | null;
    quantityUnit?: string | null;
    applicationMethod?: string | null;
    cost?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ApiFertilizerResponse = {
    id: string;
    fieldId?: string;
    applicationDate: string | Date;
    fertilizerType?: string | null;
    quantity?: string | null;
    quantityUnit?: string | null;
    applicationMethod?: string | null;
    cost?: string | null;
    notes?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    createdBy?: {
        id: string;
        name?: string;
        email?: string;
    };
    updatedBy?: {
        id: string;
        name?: string;
        email?: string;
    };
    field?: {
        id: string;
        fieldName: string;
    };
};

export type FertilizerApiResponse = {
    message: string;
    data: {
        fertilizers: ApiFertilizerResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type FertilizerDetailsResponse = {
    message: string;
    data: {
        fertilizer: ApiFertilizerResponse;
    };
};

export type AddFertilizerValues = {
    fieldId: string;
    applicationDate: string;
    fertilizerType?: string;
    quantity?: string | "";
    quantityUnit?: string;
    applicationMethod?: string;
    cost?: string | "";
    notes?: string;
};

export type FilterValues = {
    search: string;
    fieldId: string;
    applicationDateFrom: string;
    applicationDateTo: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

// API Parameter Types
export interface GetFertilizersParams {
    page?: number;
    limit?: number;
    fieldId?: string;
    applicationDateFrom?: string;
    applicationDateTo?: string;
}

export interface CreateFertilizerData {
    fieldId: string;
    applicationDate?: string;
    fertilizerType?: string;
    quantity?: string;
    quantityUnit?: string;
    applicationMethod?: string;
    cost?: string;
    notes?: string;
}

// Component Prop Types
export interface AddFertilizerModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddFertilizerValues) => Promise<void>;
    isSubmitting: boolean;
}

export interface UpdateFertilizerModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddFertilizerValues) => Promise<void>;
    isSubmitting: boolean;
    fertilizer: FertilizerRecord | null;
}

export interface FertilizerTableProps {
    fertilizers: FertilizerRecord[];
    pagination?: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (fertilizer: FertilizerRecord) => void;
    onDelete: (fertilizer: FertilizerRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface FertilizerFiltersProps {
    onOpenFilters: () => void;
}

export interface FertilizerFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

// Cost Summary Types
export type FertilizerCostSummaryItem = {
    fieldId: string;
    fieldName: string;
    totalCost: number;
};

export type FertilizerCostSummaryResponse = {
    message: string;
    data: {
        summary: FertilizerCostSummaryItem[];
        totalFields: number;
        totalCost: number;
    };
};

// Constants
export const QUANTITY_UNIT_OPTIONS = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "tons", label: "Tons" },
    { value: "liters", label: "Liters" },
    { value: "bags", label: "Bags" },
] as const;

export const FERTILIZER_TYPE_OPTIONS = [
    { value: "NPK 20-20-20", label: "NPK 20-20-20" },
    { value: "NPK 10-10-10", label: "NPK 10-10-10" },
    { value: "Urea", label: "Urea" },
    { value: "DAP", label: "DAP (Diammonium Phosphate)" },
    { value: "Potash", label: "Potash" },
    { value: "Organic", label: "Organic" },
    { value: "Compost", label: "Compost" },
    { value: "Other", label: "Other" },
] as const;

export const APPLICATION_METHOD_OPTIONS = [
    { value: "Broadcast", label: "Broadcast" },
    { value: "Side Dressing", label: "Side Dressing" },
    { value: "Foliar", label: "Foliar Application" },
    { value: "Fertigation", label: "Fertigation" },
    { value: "Top Dressing", label: "Top Dressing" },
    { value: "Other", label: "Other" },
] as const;

