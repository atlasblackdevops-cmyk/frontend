"use client";

import { Select, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer } from "@/components/ui";
import { useActiveFieldsOptions } from "@/components/shared/hooks/useActiveFieldsOptions";
import type {
    CropHealthNoteFiltersDrawerProps,
    FilterValues,
} from "../types";
import { HEALTH_STATUS_OPTIONS } from "../types";
import "@mantine/dates/styles.css";

export function CropHealthNoteFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: CropHealthNoteFiltersDrawerProps) {
    const { options: fieldOptions, loading: loadingFields } =
        useActiveFieldsOptions(opened);

    const filterForm = useForm<FilterValues>({
        initialValues: filters,
    });

    const handleApply = () => {
        onApplyFilters(filterForm.values);
        onClose();
    };

    const handleClear = () => {
        filterForm.reset();
        onClearFilters();
    };

    return (
        <TableFiltersDrawer
            opened={opened}
            onClose={onClose}
            onApply={handleApply}
            onClear={handleClear}
            title="Filter Crop Health Notes"
        >
            <Select
                label="Field"
                placeholder={
                    loadingFields ? "Loading fields..." : "All Fields"
                }
                data={[
                    { value: "all", label: "All Fields" },
                    ...fieldOptions,
                ]}
                disabled={loadingFields}
                searchable
                clearable
                {...filterForm.getInputProps("fieldId")}
            />

            <Select
                label="Health Status"
                placeholder="All Statuses"
                data={HEALTH_STATUS_OPTIONS}
                clearable
                {...filterForm.getInputProps("healthStatus")}
            />

            <DateInput
                label="Date From"
                placeholder="Select start date"
                valueFormat="YYYY-MM-DD"
                value={
                    filterForm.values.dateFrom
                        ? new Date(filterForm.values.dateFrom)
                        : null
                }
                onChange={(value) => {
                    const d = value ? new Date(value as string) : null;
                    filterForm.setFieldValue(
                        "dateFrom",
                        d ? d.toISOString().split("T")[0] : ""
                    );
                }}
                clearable
            />

            <DateInput
                label="Date To"
                placeholder="Select end date"
                valueFormat="YYYY-MM-DD"
                value={
                    filterForm.values.dateTo
                        ? new Date(filterForm.values.dateTo)
                        : null
                }
                onChange={(value) => {
                    const d = value ? new Date(value as string) : null;
                    filterForm.setFieldValue(
                        "dateTo",
                        d ? d.toISOString().split("T")[0] : ""
                    );
                }}
                clearable
            />
        </TableFiltersDrawer>
    );
}

