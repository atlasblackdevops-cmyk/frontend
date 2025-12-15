export type IrrigationRecord = {
    id: string;
    fieldId: string;
    fieldName?: string;
    irrigationDate: string;
    irrigationMethod?: string | null;
    waterVolume?: string | null;
    volumeUnit?: string | null;
    durationMinutes?: number | null;
    cost?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ApiIrrigationResponse = {
    id: string;
    fieldId?: string;
    irrigationDate: string | Date;
    irrigationMethod?: string | null;
    waterVolume?: string | null;
    volumeUnit?: string | null;
    durationMinutes?: number | null;
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
    plantingRecord?: {
        id: string;
    } | null;
};

export type IrrigationApiResponse = {
    message: string;
    data: {
        irrigations: ApiIrrigationResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type IrrigationDetailsResponse = {
    message: string;
    data: {
        irrigation: ApiIrrigationResponse;
    };
};

export type AddIrrigationValues = {
    fieldId: string;
    irrigationDate: string;
    irrigationMethod?: string;
    waterVolume?: string | "";
    volumeUnit?: string;
    durationMinutes?: number | "";
    cost?: string | "";
    plantingRecordId?: string;
    notes?: string;
};

export type FilterValues = {
    search: string;
    fieldId: string;
    irrigationDateFrom: string;
    irrigationDateTo: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

// API Parameter Types
export interface GetIrrigationsParams {
    page?: number;
    limit?: number;
    fieldId?: string;
    irrigationDateFrom?: string;
    irrigationDateTo?: string;
}

export interface CreateIrrigationData {
    fieldId: string;
    irrigationDate?: string;
    irrigationMethod?: string;
    waterVolume?: string;
    volumeUnit?: string;
    durationMinutes?: number;
    cost?: string;
    plantingRecordId?: string;
    notes?: string;
}

// Component Prop Types
export interface AddIrrigationModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddIrrigationValues) => Promise<void>;
    isSubmitting: boolean;
}

export interface UpdateIrrigationModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddIrrigationValues) => Promise<void>;
    isSubmitting: boolean;
    irrigation: IrrigationRecord | null;
}

export interface IrrigationTableProps {
    irrigations: IrrigationRecord[];
    pagination?: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (irrigation: IrrigationRecord) => void;
    onDelete: (irrigation: IrrigationRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface IrrigationFiltersProps {
    onOpenFilters: () => void;
}

export interface IrrigationFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

// Constants
export const VOLUME_UNIT_OPTIONS = [
    { value: "liters", label: "Liters" },
    { value: "gallons", label: "Gallons" },
    { value: "cubic_meters", label: "Cubic Meters" },
    { value: "acre_feet", label: "Acre Feet" },
] as const;

export const IRRIGATION_METHOD_OPTIONS = [
    { value: "Drip", label: "Drip Irrigation" },
    { value: "Sprinkler", label: "Sprinkler" },
    { value: "Flood", label: "Flood Irrigation" },
    { value: "Manual", label: "Manual" },
    { value: "Other", label: "Other" },
] as const;
