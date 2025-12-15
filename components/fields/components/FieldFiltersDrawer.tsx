"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer } from "@/components/ui";
import type { FilterValues, FieldFiltersDrawerProps } from "../types";
import { SOIL_TYPE_OPTIONS, ACTIVE_STATUS_OPTIONS } from "../types";

export default function FieldFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: FieldFiltersDrawerProps) {
    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            soilType: filters.soilType,
            isActive: filters.isActive,
        },
    });

    const handleApply = () => {
        onApplyFilters({
            ...form.values,
            search: filters.search, // Keep search value from parent
        });
        onClose();
    };

    const handleClear = () => {
        form.setValues({
            soilType: "all",
            isActive: "all",
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
                label="Soil Type"
                placeholder="All soil types"
                data={SOIL_TYPE_OPTIONS}
                value={form.values.soilType}
                onChange={(value) => form.setFieldValue("soilType", value || "all")}
            />

            <Select
                label="Status"
                placeholder="All status"
                data={ACTIVE_STATUS_OPTIONS}
                value={form.values.isActive}
                onChange={(value) => form.setFieldValue("isActive", value || "all")}
            />
        </TableFiltersDrawer>
    );
}

