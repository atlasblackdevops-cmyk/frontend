"use client";

import { Button, Group, Paper, Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import type { FilterValues } from "../types";
import { GENDER_OPTIONS } from "../types";

interface AnimalFiltersProps {
    form: UseFormReturnType<FilterValues>;
    onSearch: () => void;
    onClear: () => void;
    isLoading: boolean;
}

export default function AnimalFilters({
    form,
    onSearch,
    onClear,
    isLoading,
}: AnimalFiltersProps) {
    return (
        <Paper withBorder p="md" radius="md">
            <Stack gap="md">
                <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 4 }}
                    spacing="md"
                >
                    <TextInput
                        label="Search"
                        placeholder="Search by name, species, breed..."
                        leftSection={<IconSearch size={16} />}
                        {...form.getInputProps("search")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onSearch();
                            }
                        }}
                    />
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
                </SimpleGrid>
                <Group justify="flex-end">
                    <Button variant="default" onClick={onClear}>
                        Clear
                    </Button>
                    <Button
                        leftSection={<IconSearch size={16} />}
                        onClick={onSearch}
                        loading={isLoading}
                    >
                        Search
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}

