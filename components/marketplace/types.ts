import type {
    Listing,
    ListingImage,
    BrowseListing,
    PaginationInfo as ApiPaginationInfo,
} from "@/lib/marketplace/api";

export type ListingRecord = Listing;
export type ListingImageRecord = ListingImage;
export type BrowseListingRecord = BrowseListing;

export type PaginationInfo = ApiPaginationInfo;

export type CreateListingValues = {
    title: string;
    description: string;
    category: string;
    price: number | "";
    quantityAvailable: number | "";
    quantityUnit: string;
    city: string;
    state: string;
    country: string;
    shippingAvailable: boolean;
    status: string;
    photos: File[];
};

export type UpdateListingValues = Partial<CreateListingValues> & {
    photos?: File[];
    photosToRemove?: string[]; // Image IDs to remove
};

export type ListingFilterValues = {
    search: string;
    category: string;
    status: string;
    city: string;
    state: string;
    country: string;
};

export type BrowseFilterValues = {
    search: string;
    category: string;
    city: string;
    state: string;
    country: string;
    maxDistance: number | "";
    latitude: number | "";
    longitude: number | "";
};

export const LISTING_CATEGORY_OPTIONS = [
    { value: "all", label: "All Categories" },
    { value: "produce", label: "Produce" },
    { value: "livestock", label: "Livestock" },
    { value: "equipment", label: "Equipment" },
    { value: "seeds", label: "Seeds" },
    { value: "fertilizer", label: "Fertilizer" },
    { value: "other", label: "Other" },
] as const;

export const LISTING_STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "sold", label: "Sold" },
    { value: "pending", label: "Pending" },
] as const;

// Component Prop Types
export interface ListingsTableProps {
    listings: ListingRecord[];
    pagination: PaginationInfo;
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (listing: ListingRecord) => void;
    onDelete: (listing: ListingRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface BrowseGridProps {
    listings: BrowseListingRecord[];
    pagination: PaginationInfo;
    isLoading: boolean;
    onViewDetails: (listing: BrowseListingRecord) => void;
    onPageChange?: (page: number) => void;
}

export interface ListingFiltersProps {
    onOpenFilters: () => void;
    activeFiltersCount?: number;
}

export interface ListingFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: ListingFilterValues;
    onApplyFilters: (filters: ListingFilterValues) => void;
    onClearFilters: () => void;
}

export interface BrowseFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: BrowseFilterValues;
    onApplyFilters: (filters: BrowseFilterValues) => void;
    onClearFilters: () => void;
}

export interface CreateListingModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: CreateListingValues) => Promise<void>;
    isSubmitting: boolean;
}

export interface EditListingModalProps {
    opened: boolean;
    onClose: () => void;
    listing: ListingRecord | null;
    onSubmit: (values: UpdateListingValues) => Promise<void>;
    isSubmitting: boolean;
}

export interface ListingDetailModalProps {
    opened: boolean;
    onClose: () => void;
    listingId: string | null;
}

