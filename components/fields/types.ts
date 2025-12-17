export type FieldRecord = {
    id: string;
    farmId: string;
    fieldName: string;
    fieldSize?: number | null;
    sizeUnit?: string | null;
    soilType?: string | null;
    isActive: boolean;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ApiFieldResponse = {
    id: string;
    farmId: string;
    fieldName: string;
    fieldSize?: number | null;
    sizeUnit?: string | null;
    soilType?: string | null;
    isActive: boolean;
    notes?: string | null;
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

export type FieldsApiResponse = {
    message: string;
    data: {
        fields: ApiFieldResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type FieldDetailsResponse = {
    message: string;
    data: {
        field: ApiFieldResponse;
    };
};

export type AddFieldValues = {
    fieldName: string;
    fieldSize?: number | "";
    sizeUnit?: string;
    soilType?: string;
    isActive: boolean;
    notes?: string;
};

export type FilterValues = {
    search: string;
    soilType: string;
    isActive: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

// API Parameter Types
export interface GetFieldsParams {
    page?: number;
    limit?: number;
    search?: string;
    soilType?: string;
    isActive?: boolean;
}

export interface CreateFieldData {
    fieldName: string;
    fieldSize?: number;
    sizeUnit?: string;
    soilType?: string;
    isActive?: boolean;
    notes?: string;
}

// Component Prop Types
export interface AddFieldModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddFieldValues) => Promise<void>;
    isSubmitting: boolean;
}

export interface UpdateFieldModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddFieldValues) => Promise<void>;
    isSubmitting: boolean;
    field: FieldRecord | null;
}

export interface FieldTableProps {
    fields: FieldRecord[];
    pagination?: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (field: FieldRecord) => void;
    onDelete: (field: FieldRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface FieldFiltersProps {
    onOpenFilters: () => void;
    activeFiltersCount?: number;
}

export interface FieldFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

// Constants
export const SIZE_UNIT_OPTIONS = [
    { value: "acres", label: "Acres" },
    { value: "hectares", label: "Hectares" },
    { value: "square_meters", label: "Square Meters" },
    { value: "square_feet", label: "Square Feet" },
] as const;

export const SOIL_TYPE_OPTIONS = [
    { value: "all", label: "All Soil Types" },
    { value: "clay", label: "Clay" },
    { value: "sandy", label: "Sandy" },
    { value: "loamy", label: "Loamy" },
    { value: "silt", label: "Silt" },
    { value: "peat", label: "Peat" },
    { value: "chalk", label: "Chalk" },
    { value: "other", label: "Other" },
] as const;

export const ACTIVE_STATUS_OPTIONS = [
    { value: "all", label: "All" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
] as const;

