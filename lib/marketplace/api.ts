import { api } from "@/lib/api";

export interface ListingImage {
    id: string;
    imageUrl: string;
    listingId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Listing {
    id: string;
    title: string;
    description: string | null;
    category: string;
    price: string;
    quantityAvailable: string;
    quantityUnit: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    shippingAvailable: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    farm?: {
        id: string;
        farmName: string;
    };
    images?: ListingImage[];
}

export interface BrowseListing {
    id: string;
    title: string;
    price: string;
    category: string;
    city: string | null;
    state: string | null;
    country: string | null;
    shippingAvailable: boolean;
    imageUrl: string | null;
    farm: {
        id: string;
        farmName: string;
    };
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ListingsApiResponse {
    message?: string;
    data?: {
        listings: Listing[];
        pagination: PaginationInfo;
    };
}

export interface ListingDetailsResponse {
    message?: string;
    data?: {
        listing: Listing;
    };
}

export interface BrowseListingsApiResponse {
    message?: string;
    data?: {
        listings: BrowseListing[];
        pagination: PaginationInfo;
    };
}

export interface BrowseListingDetailsResponse {
    message?: string;
    data?: {
        listing: Listing;
    };
}

export interface GetListingsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    city?: string;
    state?: string;
    country?: string;
}

export interface BrowseListingsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    city?: string;
    state?: string;
    country?: string;
    maxDistance?: number;
    latitude?: number;
    longitude?: number;
}

export interface CreateListingData {
    title: string;
    description?: string;
    category?: string;
    price: number;
    quantityAvailable: number;
    quantityUnit?: string;
    city?: string;
    state?: string;
    country?: string;
    shippingAvailable?: boolean;
    status?: string;
    photos?: File[];
}

export interface UpdateListingData extends Partial<CreateListingData> {
    photos?: File[];
    photosToRemove?: string[];
}

function buildListingsQueryParams(params: GetListingsParams = {}): URLSearchParams {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.search?.trim()) {
        queryParams.append("search", params.search.trim());
    }
    if (params.category && params.category !== "all") {
        queryParams.append("category", params.category);
    }
    if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
    }
    if (params.city?.trim()) {
        queryParams.append("city", params.city.trim());
    }
    if (params.state?.trim()) {
        queryParams.append("state", params.state.trim());
    }
    if (params.country?.trim()) {
        queryParams.append("country", params.country.trim());
    }

    return queryParams;
}

function buildBrowseQueryParams(params: BrowseListingsParams = {}): URLSearchParams {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.search?.trim()) {
        queryParams.append("search", params.search.trim());
    }
    if (params.category && params.category !== "all") {
        queryParams.append("category", params.category);
    }
    if (params.city?.trim()) {
        queryParams.append("city", params.city.trim());
    }
    if (params.state?.trim()) {
        queryParams.append("state", params.state.trim());
    }
    if (params.country?.trim()) {
        queryParams.append("country", params.country.trim());
    }
    if (params.maxDistance !== undefined && params.maxDistance !== null) {
        queryParams.append("maxDistance", params.maxDistance.toString());
    }
    if (params.latitude !== undefined && params.latitude !== null) {
        queryParams.append("latitude", params.latitude.toString());
    }
    if (params.longitude !== undefined && params.longitude !== null) {
        queryParams.append("longitude", params.longitude.toString());
    }

    return queryParams;
}

function buildListingFormData(data: CreateListingData | UpdateListingData): FormData {
    const formData = new FormData();

    if (data.title !== undefined) {
        formData.append("title", data.title);
    }
    if (data.description !== undefined) {
        formData.append("description", data.description || "");
    }
    if (data.category !== undefined) {
        formData.append("category", data.category);
    }
    if (data.price !== undefined && data.price !== null) {
        formData.append("price", data.price.toString());
    }
    if (data.quantityAvailable !== undefined && data.quantityAvailable !== null) {
        formData.append("quantityAvailable", data.quantityAvailable.toString());
    }
    if (data.quantityUnit !== undefined) {
        formData.append("quantityUnit", data.quantityUnit || "");
    }
    if (data.city !== undefined) {
        formData.append("city", data.city || "");
    }
    if (data.state !== undefined) {
        formData.append("state", data.state || "");
    }
    if (data.country !== undefined) {
        formData.append("country", data.country || "");
    }
    if (data.shippingAvailable !== undefined) {
        formData.append("shippingAvailable", data.shippingAvailable ? "true" : "false");
    }
    if (data.status !== undefined) {
        formData.append("status", data.status);
    }
    
    // Handle photos
    if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo) => {
            formData.append("photos", photo);
        });
    }
    
    // Handle photos to remove
    if ((data as UpdateListingData).photosToRemove && (data as UpdateListingData).photosToRemove!.length > 0) {
        (data as UpdateListingData).photosToRemove!.forEach((photoId) => {
            formData.append("photosToRemove", photoId);
        });
    }

    return formData;
}

// Farm Management API functions (own listings)
export async function getListings(
    params: GetListingsParams = {}
): Promise<ListingsApiResponse> {
    const queryParams = buildListingsQueryParams(params);
    const response = await api.get<ListingsApiResponse>(
        `/api/v1/marketplace/listings?${queryParams.toString()}`
    );
    return response.data;
}

export async function getListingDetails(
    listingId: string
): Promise<Listing> {
    const response = await api.get<ListingDetailsResponse>(
        `/api/v1/marketplace/listings/${listingId}`
    );

    const responseData = response.data?.data;
    const listing = responseData?.listing;

    if (!listing) {
        throw new Error("Listing not found");
    }

    return listing;
}

export async function createListing(data: CreateListingData): Promise<void> {
    const formData = buildListingFormData(data);
    await api.post("/api/v1/marketplace/listings", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export async function updateListing(
    listingId: string,
    data: UpdateListingData
): Promise<void> {
    const formData = buildListingFormData(data);
    await api.put(`/api/v1/marketplace/listings/${listingId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export async function deleteListing(listingId: string): Promise<void> {
    await api.delete(`/api/v1/marketplace/listings/${listingId}`);
}

// Browse API functions (public marketplace)
export async function browseListings(
    params: BrowseListingsParams = {}
): Promise<BrowseListingsApiResponse> {
    const queryParams = buildBrowseQueryParams(params);
    const response = await api.get<BrowseListingsApiResponse>(
        `/api/v1/marketplace/browse?${queryParams.toString()}`
    );
    return response.data;
}

export async function getBrowseListingDetails(
    listingId: string
): Promise<Listing> {
    const response = await api.get<BrowseListingDetailsResponse>(
        `/api/v1/marketplace/browse/${listingId}`
    );

    const responseData = response.data?.data;
    const listing = responseData?.listing;

    if (!listing) {
        throw new Error("Listing not found");
    }

    return listing;
}

