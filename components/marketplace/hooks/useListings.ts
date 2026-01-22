"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/use-auth-store";
import type {
    ListingRecord,
    PaginationInfo,
} from "../types";
import {
    getListings,
    getListingDetails,
    createListing,
    updateListing,
    deleteListing,
    type GetListingsParams,
    type CreateListingData,
    type UpdateListingData,
} from "@/lib/marketplace/api";

interface FetchListingsFilters {
    search?: string;
    category?: string;
    status?: string;
    city?: string;
    state?: string;
    country?: string;
}

interface MutationResult {
    success: boolean;
    data?: ListingRecord;
    error?: string;
}

const DEFAULT_PAGINATION: PaginationInfo = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

function extractErrorMessage(err: any, defaultMessage: string): string {
    return (
        err?.response?.data?.message ??
        err?.message ??
        defaultMessage
    );
}

export function useListings() {
    const { farmId } = useAuth();
    
    const [listings, setListings] = useState<ListingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = useCallback(
        async (page: number = 1, filters?: FetchListingsFilters) => {
            if (!farmId) {
                setError("Farm ID is required");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params: GetListingsParams = {
                    page,
                    limit: pagination.limit,
                    ...filters,
                };

                const response = await getListings(params);
                const responseData = response?.data;
                const listingsData = responseData?.listings ?? [];
                const paginationData = responseData?.pagination ?? DEFAULT_PAGINATION;

                setListings(listingsData);
                setPagination(paginationData);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch listings");
                setError(errorMessage);
                setListings([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.limit]
    );

    const fetchListingDetails = useCallback(
        async (listingId: string): Promise<ListingRecord | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const listingData = await getListingDetails(listingId);
                return listingData;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch listing details");
                setError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const createListingRecord = useCallback(
        async (data: CreateListingData): Promise<MutationResult> => {
            if (!farmId) {
                const errorMsg = "Farm ID is required";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            setIsLoading(true);
            setError(null);

            try {
                await createListing(data);
                
                await fetchListings(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to create listing");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [farmId, pagination.page, fetchListings]
    );

    const updateListingRecord = useCallback(
        async (listingId: string, data: UpdateListingData): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await updateListing(listingId, data);

                await fetchListings(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to update listing");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchListings]
    );

    const deleteListingRecord = useCallback(
        async (listingId: string): Promise<MutationResult> => {
            setIsLoading(true);
            setError(null);

            try {
                await deleteListing(listingId);
                
                await fetchListings(pagination.page);
                
                return { success: true };
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to delete listing");
                setError(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.page, fetchListings]
    );

    return {
        listings,
        isLoading,
        pagination,
        error,
        fetchListings,
        fetchListingDetails,
        createListing: createListingRecord,
        updateListing: updateListingRecord,
        deleteListing: deleteListingRecord,
        setPagination,
    };
}

