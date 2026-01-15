"use client";

import { useForm } from "@mantine/form";
import { TableFiltersDrawer } from "@/components/ui";
import { BaseDateInput } from "@/components/ui";
import type { FilterValues } from "../types";

interface RevenueFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export default function RevenueFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: RevenueFiltersDrawerProps) {
    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            revenueDateFrom: filters.revenueDateFrom,
            revenueDateTo: filters.revenueDateTo,
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
            revenueDateFrom: "",
            revenueDateTo: "",
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
            <BaseDateInput
                label="Revenue Date From"
                placeholder="Select start date"
                value={form.values.revenueDateFrom}
                clearable
                onChange={(date) => {
                    form.setFieldValue("revenueDateFrom", date || "");
                }}
            />

            <BaseDateInput
                label="Revenue Date To"
                placeholder="Select end date"
                value={form.values.revenueDateTo ? new Date(form.values.revenueDateTo) : null}
                clearable
                onChange={(date) => {
                    form.setFieldValue("revenueDateTo", date || "");
                }}
            />
        </TableFiltersDrawer>
    );
}

