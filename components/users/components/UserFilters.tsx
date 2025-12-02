"use client";

import { Group, Select, TextInput } from "@mantine/core";
import { IconFilter, IconSearch, IconShieldLock } from "@tabler/icons-react";

interface UserFiltersProps {
    filters: {
        search: string;
        role: string;
        status: string;
    };
    roleOptions: { value: string; label: string }[];
    onFilterChange: (filters: {
        search: string;
        role: string;
        status: string;
    }) => void;
    onPageReset: () => void;
}

export default function UserFilters({
    filters,
    roleOptions,
    onFilterChange,
    onPageReset,
}: UserFiltersProps) {
    return (
        <Group justify="space-between" mb="md">
            <Group gap="xs">
                <Select
                    placeholder="Role"
                    leftSection={<IconShieldLock size={16} />}
                    data={[
                        { value: "all", label: "All roles" },
                        ...roleOptions,
                    ]}
                    value={filters.role}
                    onChange={(value) => {
                        onFilterChange({
                            ...filters,
                            role: value ?? "all",
                        });
                        onPageReset();
                    }}
                    w={180}
                />
                <Select
                    placeholder="Status"
                    leftSection={<IconFilter size={16} />}
                    data={[
                        { value: "all", label: "All statuses" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                    ]}
                    value={filters.status}
                    w={180}
                    onChange={(value) => {
                        onFilterChange({
                            ...filters,
                            status: value ?? "all",
                        });
                        onPageReset();
                    }}
                />
                <TextInput
                    placeholder="Search users"
                    leftSection={<IconSearch size={16} />}
                    value={filters.search}
                    onChange={(event) =>
                        onFilterChange({
                            ...filters,
                            search: event.currentTarget.value,
                        })
                    }
                    style={{ flex: 1, maxWidth: 300 }}
                />
            </Group>
        </Group>
    );
}

