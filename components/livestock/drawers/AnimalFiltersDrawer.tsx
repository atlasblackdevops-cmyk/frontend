"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { BaseDateInput, TableFiltersDrawer } from "@/components/ui";
import type { FilterValues } from "../types";
import { GENDER_OPTIONS } from "../types";

export interface AnimalFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
    onClearFilters: () => void;
}

export default function AnimalFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: AnimalFiltersDrawerProps) {
    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            gender: filters.gender,
            birthdateFrom: filters.birthdateFrom,
            birthdateTo: filters.birthdateTo,
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
            gender: "all",
            birthdateFrom: "",
            birthdateTo: "",
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
                label="Gender"
                placeholder="Select gender"
                data={GENDER_OPTIONS}
                {...form.getInputProps("gender")}
            />

            <BaseDateInput
                label="Birthdate From"
                placeholder="Select start date"
                value={form.values.birthdateFrom ? new Date(form.values.birthdateFrom) : null}
                onChange={(date) => {
                    if (date && typeof date === 'object' && 'toISOString' in date) {
                        form.setFieldValue("birthdateFrom", (date as Date).toISOString().split('T')[0]);
                    } else {
                        form.setFieldValue("birthdateFrom", "");
                    }
                }}
            />

            <BaseDateInput
                label="Birthdate To"
                placeholder="Select end date"
                value={form.values.birthdateTo ? new Date(form.values.birthdateTo) : null}
                onChange={(date) => {
                    if (date && typeof date === 'object' && 'toISOString' in date) {
                        form.setFieldValue("birthdateTo", (date as Date).toISOString().split('T')[0]);
                    } else {
                        form.setFieldValue("birthdateTo", "");
                    }
                }}
            />
        </TableFiltersDrawer>
    );
}

