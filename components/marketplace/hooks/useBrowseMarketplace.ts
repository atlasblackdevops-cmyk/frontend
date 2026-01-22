"use client";

import { useState, useCallback } from "react";
import type {
    BrowseListingRecord,
    PaginationInfo,
} from "../types";
import {
    browseListings,
    getBrowseListingDetails,
    type BrowseListingsParams,
} from "@/lib/marketplace/api";

interface BrowseFilters {
    search?: string;
    category?: string;
    city?: string;
    state?: string;
    country?: string;
    maxDistance?: number;
    latitude?: number;
    longitude?: number;
}

const DEFAULT_PAGINATION: PaginationInfo = {
    page: 1,
    limit: 12,
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

export function useBrowseMarketplace() {
    const [listings, setListings] = useState<BrowseListingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
    const [error, setError] = useState<string | null>(null);

    const fetchBrowseListings = useCallback(
        async (page: number = 1, filters?: BrowseFilters) => {
            setIsLoading(true);
            setError(null);

            try {
                const params: BrowseListingsParams = {
                    page,
                    limit: pagination.limit,
                    ...filters,
                };

                const response = await browseListings(params);
                const responseData = response?.data;
                const listingsData = responseData?.listings ?? [];
                const paginationData = responseData?.pagination ?? DEFAULT_PAGINATION;

                setListings(listingsData);
                setPagination(paginationData);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, "Failed to fetch marketplace listings");
                setError(errorMessage);
                setListings([]);
                setPagination(DEFAULT_PAGINATION);
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.limit]
    );

    const fetchListingDetails = useCallback(
        async (listingId: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const listingData = await getBrowseListingDetails(listingId);
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

    return {
        listings,
        isLoading,
        pagination,
        error,
        fetchBrowseListings,
        fetchListingDetails,
        setPagination,
    };
}

