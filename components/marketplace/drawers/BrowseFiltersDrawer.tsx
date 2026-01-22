"use client";

import { useEffect } from "react";
import { Select, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer, BaseInput } from "@/components/ui";
import type { BrowseFilterValues, BrowseFiltersDrawerProps } from "../types";
import { LISTING_CATEGORY_OPTIONS } from "../types";

export default function BrowseFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: BrowseFiltersDrawerProps) {
    const form = useForm<Omit<BrowseFilterValues, "search">>({
        initialValues: {
            category: filters.category,
            city: filters.city,
            state: filters.state,
            country: filters.country,
            maxDistance: filters.maxDistance,
            latitude: filters.latitude,
            longitude: filters.longitude,
        },
    });

    // Reset form to current filters when drawer opens or filters change
    useEffect(() => {
        if (opened) {
            form.setValues({
                category: filters.category,
                city: filters.city,
                state: filters.state,
                country: filters.country,
                maxDistance: filters.maxDistance,
                latitude: filters.latitude,
                longitude: filters.longitude,
            });
        }
    }, [
        opened,
        filters.category,
        filters.city,
        filters.state,
        filters.country,
        filters.maxDistance,
        filters.latitude,
        filters.longitude,
    ]);

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
            city: "",
            state: "",
            country: "",
            maxDistance: "",
            latitude: "",
            longitude: "",
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

            <NumberInput
                label="Max Distance (km)"
                placeholder="e.g. 50"
                min={0}
                {...form.getInputProps("maxDistance")}
            />

            <NumberInput
                label="Latitude"
                placeholder="e.g. 39.7817"
                decimalScale={6}
                {...form.getInputProps("latitude")}
            />

            <NumberInput
                label="Longitude"
                placeholder="e.g. -89.6501"
                decimalScale={6}
                {...form.getInputProps("longitude")}
            />
        </TableFiltersDrawer>
    );
}

