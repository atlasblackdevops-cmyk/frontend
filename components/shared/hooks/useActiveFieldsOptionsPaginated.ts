"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getActiveFieldsPaginated } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

export interface SelectOption {
    value: string;
    label: string;
}

interface UseActiveFieldsOptionsPaginatedResult {
    options: SelectOption[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    search: (query: string) => void;
    searchQuery: string;
    addOption: (option: SelectOption) => void;
}

export function useActiveFieldsOptionsPaginated(
    enabled: boolean = true
): UseActiveFieldsOptionsPaginatedResult {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    const loadingRef = useRef(false);
    const pageRef = useRef(1);
    const searchQueryRef = useRef("");

    const loadFields = useCallback(async (pageNum: number, query: string, append: boolean = true) => {
        if (!enabled || loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        try {
            const response = await getActiveFieldsPaginated(pageNum, 20, query);
            const fields = response.data?.fields || [];
            
            const newOptions = fields.map((field) => ({
                value: field.id,
                label: field.fieldName,
            }));

            setOptions((prev) => append ? [...prev, ...newOptions] : newOptions);
            
            const pagination = response.data?.pagination;
            if (pagination) {
                setHasMore(pagination.page < pagination.totalPages);
                pageRef.current = pagination.page;
            } else {
                setHasMore(false);
            }
        } catch (error) {
            setOptions([]);
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [enabled]);

    // Initial load
    useEffect(() => {
        if (enabled) {
            setPage(1);
            pageRef.current = 1;
            setSearchQuery("");
            searchQueryRef.current = "";
            setOptions([]);
            loadFields(1, "", false);
        }
    }, [enabled, loadFields]);

    // Load more function for infinite scroll
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingRef.current) {
            return;
        }
        
        const nextPage = pageRef.current + 1;
        setPage(nextPage);
        await loadFields(nextPage, searchQueryRef.current, true);
    }, [hasMore, loadFields]);

    // Search function
    const search = useCallback((query: string) => {
        searchQueryRef.current = query;
        setSearchQuery(query);
        setPage(1);
        pageRef.current = 1;
        setOptions([]);
        setHasMore(true);
        loadFields(1, query, false);
    }, [loadFields]);

    // Add a specific option (useful for pre-selected values)
    const addOption = useCallback((option: SelectOption) => {
        setOptions((prev) => {
            // Only add if not already present
            if (prev.some((opt) => opt.value === option.value)) {
                return prev;
            }
            return [option, ...prev];
        });
    }, []);

    return { 
        options, 
        loading, 
        hasMore, 
        loadMore, 
        search,
        searchQuery,
        addOption
    };
}
