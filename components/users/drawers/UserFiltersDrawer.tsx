"use client";

import { Drawer, Stack, Select, Group, Button, ActionIcon } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter, IconX } from "@tabler/icons-react";

interface UserFiltersDrawerProps {
    opened: boolean;
    onClose: () => void;
    filters: {
        search: string;
        role: string;
        status: string;
    };
    roleOptions: { value: string; label: string }[];
    onApplyFilters: (filters: {
        search: string;
        role: string;
        status: string;
    }) => void;
    onClearFilters: () => void;
}

export default function UserFiltersDrawer({
    opened,
    onClose,
    filters,
    roleOptions,
    onApplyFilters,
    onClearFilters,
}: UserFiltersDrawerProps) {
    const form = useForm<Omit<typeof filters, "search">>({
        initialValues: {
            role: filters.role,
            status: filters.status,
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
            role: "all",
            status: "all",
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
                    <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label="Close filters">
                        <IconX size={20} />
                    </ActionIcon>
                </Group>
            }
            padding="md"
        >
            <Stack gap="md">
                <Select
                    label="Role"
                    placeholder="All roles"
                    data={[
                        { value: "all", label: "All roles" },
                        ...roleOptions,
                    ]}
                    value={form.values.role}
                    onChange={(value) => form.setFieldValue("role", value || "all")}
                />

                <Select
                    label="Status"
                    placeholder="All statuses"
                    data={[
                        { value: "all", label: "All statuses" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                    ]}
                    value={form.values.status}
                    onChange={(value) => form.setFieldValue("status", value || "all")}
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

