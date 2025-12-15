"use client";

import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer } from "@/components/ui";

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
        <TableFiltersDrawer
            opened={opened}
            onClose={onClose}
            onApply={handleApply}
            onClear={handleClear}
        >
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
        </TableFiltersDrawer>
    );
}

