// Crop Health Notes Types

export type CropHealthNoteRecord = {
    id: string;
    fieldId: string;
    fieldName?: string;
    noteDate: string;
    healthStatus?: string | null;
    description?: string | null;
    actionTaken?: string | null;
    images?: CropHealthImage[];
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
    createdAt: string;
    updatedAt: string;
};

export type CropHealthImage = {
    key: string;
    url: string;
    note?: string | null;
    createdAt?: string;
};

export type ApiCropHealthNoteResponse = {
    id: string;
    fieldId: string;
    fieldName?: string;
    noteDate: string;
    healthStatus?: string | null;
    description?: string | null;
    actionTaken?: string | null;
    images?: CropHealthImage[];
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
    createdAt: string;
    updatedAt: string;
};

export type CropHealthNotesApiResponse = {
    message: string;
    data: {
        notes: ApiCropHealthNoteResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
};

export type CropHealthNoteDetailsResponse = {
    message: string;
    data: {
        note: ApiCropHealthNoteResponse;
    };
};

export type AddCropHealthNoteValues = {
    fieldId: string;
    noteDate: string;
    healthStatus?: string;
    description?: string;
    actionTaken?: string;
    images?: File[];
    imageNotes?: string[];
};

export type FilterValues = {
    search: string;
    fieldId: string;
    dateFrom: string;
    dateTo: string;
    healthStatus: string;
};

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export const HEALTH_STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "Healthy", label: "Healthy" },
    { value: "Diseased", label: "Diseased" },
    { value: "Under Observation", label: "Under Observation" },
    { value: "Needs Attention", label: "Needs Attention" },
] as const;

export const HEALTH_STATUS_COLORS: Record<string, string> = {
    Healthy: "green",
    Diseased: "red",
    "Under Observation": "yellow",
    "Needs Attention": "orange",
};

export const HEALTH_STATUS_ICONS: Record<string, string> = {
    Healthy: "🟢",
    Diseased: "🔴",
    "Under Observation": "🟡",
    "Needs Attention": "⚠️",
};

// API Parameter Types
export interface GetCropHealthNotesParams {
    farmId?: string;
    page?: number;
    limit?: number;
    search?: string;
    fieldId?: string;
    dateFrom?: string;
    dateTo?: string;
    healthStatus?: string;
}

export interface CreateCropHealthNoteData {
    farmId?: string;
    fieldId: string;
    noteDate: string;
    healthStatus?: string;
    description?: string;
    actionTaken?: string;
    images?: File[];
    imageNotes?: string[];
}

export interface UpdateCropHealthNoteData extends Partial<CreateCropHealthNoteData> {
    deletedImageKeys?: string[]; // Array of image IDs to delete
    existingImageNotes?: Record<string, string>; // Map of image ID to updated note text
}

// Component Prop Types
export interface CropHealthNoteModalProps {
    mode: "create" | "update";
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AddCropHealthNoteValues) => Promise<void>;
    isSubmitting: boolean;
    note?: CropHealthNoteRecord | null;
}

export interface CropHealthNoteTimelineProps {
    notes: CropHealthNoteRecord[];
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onView: (note: CropHealthNoteRecord) => void;
    onUpdate: (note: CropHealthNoteRecord) => void;
    onDelete: (note: CropHealthNoteRecord) => void;
}

export interface CropHealthNoteFiltersProps {
    onOpenFilters: () => void;
}

export interface CropHealthNoteFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export interface CropHealthNoteDetailModalProps {
    opened: boolean;
    onClose: () => void;
    note: CropHealthNoteRecord | null;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export interface ImagePreviewCardProps {
    image: File | CropHealthImage;
    index: number;
    note?: string;
    onNoteChange: (index: number, note: string) => void;
    onRemove: (index: number) => void;
    isUploading?: boolean;
}

