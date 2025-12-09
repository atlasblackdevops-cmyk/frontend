"use client";

import { Drawer, Stack, Select, Group, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BaseDateInput } from "@/components/ui";
import type { FilterValues } from "../types";
import { CROP_OPTIONS } from "../types";
import { getActiveFields } from "@/lib/fields/api";
import type { FieldRecord } from "@/components/fields/types";

interface PlantingFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export default function PlantingFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: PlantingFiltersDrawerProps) {
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
            crop: filters.crop,
            fieldId: filters.fieldId,
            plantingDateFrom: filters.plantingDateFrom,
            plantingDateTo: filters.plantingDateTo,
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
            crop: "all",
            fieldId: "all",
            plantingDateFrom: "",
            plantingDateTo: "",
        });
        onClearFilters();
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconFilter size={20} />
                    <span>Filters</span>
                </Group>
            }
            position="right"
            size="md"
        >
            <Stack gap="md">
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
                    label="Crop"
                    placeholder="All crops"
                    data={CROP_OPTIONS}
                    value={form.values.crop}
                    onChange={(value) => form.setFieldValue("crop", value || "all")}
                />

                <BaseDateInput
                    label="Planting Date From"
                    placeholder="Select start date"
                    value={form.values.plantingDateFrom ? new Date(form.values.plantingDateFrom) : null}
                    onChange={(date) => {
                        if (date && typeof date === 'object' && 'toISOString' in date) {
                            form.setFieldValue("plantingDateFrom", (date as Date).toISOString().split('T')[0]);
                        } else {
                            form.setFieldValue("plantingDateFrom", "");
                        }
                    }}
                />

                <BaseDateInput
                    label="Planting Date To"
                    placeholder="Select end date"
                    value={form.values.plantingDateTo ? new Date(form.values.plantingDateTo) : null}
                    onChange={(date) => {
                        if (date && typeof date === 'object' && 'toISOString' in date) {
                            form.setFieldValue("plantingDateTo", (date as Date).toISOString().split('T')[0]);
                        } else {
                            form.setFieldValue("plantingDateTo", "");
                        }
                    }}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={handleClear}>
                        Clear All
                    </Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </Group>
            </Stack>
        </Drawer>
    );
}

