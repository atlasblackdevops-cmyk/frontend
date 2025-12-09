"use client";

import { Drawer, Stack, Select, Group, Button, ActionIcon, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter, IconX } from "@tabler/icons-react";
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
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="md"
            title={
                <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="xs" align="center" wrap="nowrap">
                        <IconFilter size={20} />
                        <span style={{ fontWeight: 600, fontSize: 20 }}>Filters</span>
                    </Group>
                    <ActionIcon
                        variant="subtle"
                        onClick={onClose}
                        aria-label="Close drawer"
                    >
                        <IconX size={18} />
                    </ActionIcon>
                </Group>
            }
        >
            <Stack gap="lg">
                <Select
                    label="Gender"
                    placeholder="Select gender"
                    data={GENDER_OPTIONS}
                    {...form.getInputProps("gender")}
                />

                <TextInput
                    label="Birthdate From"
                    type="date"
                    {...form.getInputProps("birthdateFrom")}
                />

                <TextInput
                    label="Birthdate To"
                    type="date"
                    {...form.getInputProps("birthdateTo")}
                />

                <Group justify="flex-end" gap="sm" mt="md">
                    <Button variant="default" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button onClick={handleApply}>
                        Apply Filters
                    </Button>
                </Group>
            </Stack>
        </Drawer>
    );
}

