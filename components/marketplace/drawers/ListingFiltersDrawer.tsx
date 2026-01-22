"use client";

import { useEffect } from "react";
import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer, BaseInput } from "@/components/ui";
import type { ListingFilterValues, ListingFiltersDrawerProps } from "../types";
import { LISTING_CATEGORY_OPTIONS, LISTING_STATUS_OPTIONS } from "../types";

export default function ListingFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: ListingFiltersDrawerProps) {
    const form = useForm<Omit<ListingFilterValues, "search">>({
        initialValues: {
            category: filters.category,
            status: filters.status,
            city: filters.city,
            state: filters.state,
            country: filters.country,
        },
    });

    // Reset form to current filters when drawer opens or filters change
    useEffect(() => {
        if (opened) {
            form.setValues({
                category: filters.category,
                status: filters.status,
                city: filters.city,
                state: filters.state,
                country: filters.country,
            });
        }
    }, [opened, filters.category, filters.status, filters.city, filters.state, filters.country]);

    const handleApply = () => {
        onApplyFilters({
            ...form.values,
            search: filters.search, // Keep search value from parent
        });
        onClose();
    };

    const handleClear = () => {
        form.setValues({
            category: "all",
            status: "all",
            city: "",
            state: "",
            country: "",
        });
        onClearFilters();
    };

    return (
        <TableFiltersDrawer
            opened={opened}
            onClose={onClose}
            onApply={handleApply}
            onClear={handleClear}
        >
            <Select
                label="Category"
                placeholder="Select category"
                data={LISTING_CATEGORY_OPTIONS}
                {...form.getInputProps("category")}
            />

            <Select
                label="Status"
                placeholder="Select status"
                data={LISTING_STATUS_OPTIONS}
                {...form.getInputProps("status")}
            />

            <BaseInput
                label="City"
                placeholder="Filter by city"
                {...form.getInputProps("city")}
            />

            <BaseInput
                label="State"
                placeholder="Filter by state"
                {...form.getInputProps("state")}
            />

            <BaseInput
                label="Country"
                placeholder="Filter by country"
                {...form.getInputProps("country")}
            />
        </TableFiltersDrawer>
    );
}

