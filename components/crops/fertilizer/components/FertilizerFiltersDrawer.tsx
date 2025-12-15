"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer, BaseDateInput } from "@/components/ui";
import type { FilterValues, FertilizerFiltersDrawerProps } from "../types";
import { useActiveFieldsOptions } from "@/components/shared/hooks/useActiveFieldsOptions";
import { useEffect } from "react";

export default function FertilizerFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: FertilizerFiltersDrawerProps) {
    const { options: fieldOptions, loading: loadingFields } = useActiveFieldsOptions(opened);

    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            fieldId: filters.fieldId,
            applicationDateFrom: filters.applicationDateFrom,
            applicationDateTo: filters.applicationDateTo,
        },
    });

    useEffect(() => {
        if (opened) {
            form.setValues({
                fieldId: filters.fieldId,
                applicationDateFrom: filters.applicationDateFrom,
                applicationDateTo: filters.applicationDateTo,
            });
            form.resetDirty();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, filters]);

    const handleApply = () => {
        onApplyFilters({
            ...form.values,
            search: filters.search, // Keep search value from parent
        });
        onClose();
    };

    const handleClear = () => {
        form.setValues({
            fieldId: "all",
            applicationDateFrom: "",
            applicationDateTo: "",
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
                label="Field"
                placeholder={loadingFields ? "Loading fields..." : "All fields"}
                data={[{ value: "all", label: "All Fields" }, ...fieldOptions]}
                value={form.values.fieldId}
                onChange={(value) => form.setFieldValue("fieldId", value || "all")}
                disabled={loadingFields}
                searchable
            />

            <BaseDateInput
                label="Application Date From"
                placeholder="Select start date"
                clearable
                value={form.values.applicationDateFrom}
                onChange={(value) => form.setFieldValue("applicationDateFrom", value || "")}
            />

            <BaseDateInput
                label="Application Date To"
                placeholder="Select end date"
                clearable
                value={form.values.applicationDateTo}
                onChange={(value) => form.setFieldValue("applicationDateTo", value || "")}
            />
        </TableFiltersDrawer>
    );
}

