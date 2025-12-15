"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { TableFiltersDrawer } from "@/components/ui";
import { BaseDateInput } from "@/components/ui";
import type { FilterValues, IrrigationFiltersDrawerProps } from "../types";
import { getActiveFields } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

export default function IrrigationFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: IrrigationFiltersDrawerProps) {
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
            fieldId: filters.fieldId,
            irrigationDateFrom: filters.irrigationDateFrom,
            irrigationDateTo: filters.irrigationDateTo,
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
            fieldId: "all",
            irrigationDateFrom: "",
            irrigationDateTo: "",
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

            <BaseDateInput
                label="Irrigation Date From"
                placeholder="Select start date"
                value={form.values.irrigationDateFrom ? new Date(form.values.irrigationDateFrom) : null}
                onChange={(date) => {
                    if (date && typeof date === 'object' && 'toISOString' in date) {
                        form.setFieldValue("irrigationDateFrom", (date as Date).toISOString().split('T')[0]);
                    } else {
                        form.setFieldValue("irrigationDateFrom", "");
                    }
                }}
            />

            <BaseDateInput
                label="Irrigation Date To"
                placeholder="Select end date"
                value={form.values.irrigationDateTo ? new Date(form.values.irrigationDateTo) : null}
                onChange={(date) => {
                    if (date && typeof date === 'object' && 'toISOString' in date) {
                        form.setFieldValue("irrigationDateTo", (date as Date).toISOString().split('T')[0]);
                    } else {
                        form.setFieldValue("irrigationDateTo", "");
                    }
                }}
            />
        </TableFiltersDrawer>
    );
}
