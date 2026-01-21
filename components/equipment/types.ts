import type {
    Equipment,
    MaintenanceLog,
} from "@/lib/equipment/api";

export type EquipmentRecord = Equipment;

export type MaintenanceLogRecord = MaintenanceLog;

export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type AddEquipmentValues = {
    equipmentName: string;
    equipmentType: string;
    brand: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    purchaseCost: number | "";
    status: string;
    notes: string;
    photo: File | null;
};

export type UpdateEquipmentValues = Partial<AddEquipmentValues> & {
    photo?: File | null;
};

export type AddMaintenanceLogValues = {
    equipmentId: string;
    maintenanceDate: string;
    maintenanceType: string;
    description: string;
    cost: number | "";
    performedBy: string;
    nextMaintenanceDate: string;
    notes: string;
};

export type UpdateMaintenanceLogValues = Partial<AddMaintenanceLogValues>;

export type FilterValues = {
    search: string;
    equipmentType: string;
    status: string;
};

export type MaintenanceFilterValues = {
    maintenanceType: string;
    maintenanceDateFrom: string;
    maintenanceDateTo: string;
};

export const EQUIPMENT_STATUS_OPTIONS = [
    { value: "all", label: "All" },
    { value: "operational", label: "Operational" },
    { value: "under_maintenance", label: "Under Maintenance" },
    { value: "broken", label: "Broken" },
    { value: "retired", label: "Retired" },
] as const;

export const EQUIPMENT_TYPE_OPTIONS = [
    { value: "all", label: "All" },
    { value: "tractor", label: "Tractor" },
    { value: "harvester", label: "Harvester" },
    { value: "sprayer", label: "Sprayer" },
    { value: "plow", label: "Plow" },
    { value: "cultivator", label: "Cultivator" },
    { value: "seeder", label: "Seeder" },
    { value: "other", label: "Other" },
] as const;

export const MAINTENANCE_TYPE_OPTIONS = [
    { value: "all", label: "All" },
    { value: "routine", label: "Routine" },
    { value: "repair", label: "Repair" },
    { value: "inspection", label: "Inspection" },
] as const;

// Component Prop Types
export interface EquipmentFiltersProps {
    onOpenFilters: () => void;
    activeFiltersCount?: number;
}

export interface EquipmentFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export interface EquipmentTableProps {
    equipment: EquipmentRecord[];
    pagination: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (equipment: EquipmentRecord) => void;
    onDelete: (equipment: EquipmentRecord) => void;
    onOpenMaintenance: (equipment: EquipmentRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface MaintenanceLogsDrawerProps {
    opened: boolean;
    onClose: () => void;
    equipment: EquipmentRecord | null;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

