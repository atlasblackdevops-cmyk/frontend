"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { BaseDateInput, TableFiltersDrawer } from "@/components/ui";
import type { HarvestFiltersDrawerProps, FilterValues } from "../types";
import { CROP_TYPE_OPTIONS } from "../types";
import { getActiveFields } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

export default function HarvestFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: HarvestFiltersDrawerProps) {
    const [fields, setFields] = useState<FieldRecord[]>([]);
    const [loadingFields, setLoadingFields] = useState(false);

    useEffect(() => {
        if (opened) {
            setLoadingFields(true);
            getActiveFields()
                .then((data) => setFields(data))
                .catch(() => setFields([]))
                .finally(() => setLoadingFields(false));
        }
    }, [opened]);

    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            cropType: filters.cropType,
            fieldId: filters.fieldId,
            harvestDateFrom: filters.harvestDateFrom,
            harvestDateTo: filters.harvestDateTo,
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
            cropType: "all",
            fieldId: "all",
            harvestDateFrom: "",
            harvestDateTo: "",
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
                data={[
                    { value: "all", label: "All Fields" },
                    ...fields.map((field) => ({
                        value: field.id,
                        label: field.fieldName,
                    })),
                ]}
                value={form.values.fieldId}
                onChange={(value) => form.setFieldValue("fieldId", value || "all")}
                disabled={loadingFields}
                searchable
            />

            <Select
                label="Crop Type"
                placeholder="All crops"
                data={CROP_TYPE_OPTIONS}
                value={form.values.cropType}
                onChange={(value) => form.setFieldValue("cropType", value || "all")}
            />

            <BaseDateInput
                label="Harvest Date From"
                placeholder="Select start date"
                value={form.values.harvestDateFrom }
                onChange={(date) => {
                        form.setFieldValue("harvestDateFrom", date ||"");
                }}
            />

            <BaseDateInput
                label="Harvest Date To"
                placeholder="Select end date"
                value={form.values.harvestDateTo }
                onChange={(date) => {
                        form.setFieldValue("harvestDateTo",date || "");
                }}
            />
        </TableFiltersDrawer>
    );
}

