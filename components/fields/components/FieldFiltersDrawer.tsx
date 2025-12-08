"use client";

import { Drawer, Stack, Select, Group, Button, ActionIcon } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter, IconX } from "@tabler/icons-react";
import type { FilterValues, FieldFiltersDrawerProps } from "../types";
import { SOIL_TYPE_OPTIONS, ACTIVE_STATUS_OPTIONS } from "../types";

export default function FieldFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: FieldFiltersDrawerProps) {
    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            soilType: filters.soilType,
            isActive: filters.isActive,
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
            soilType: "all",
            isActive: "all",
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
                    
                </Group>
            }
            styles={{
                header: { padding: "12px 4px", margin: 0, position: "sticky", top: 0, background: "white", zIndex: 1 },
                title: { margin: 0, padding: 0 },
                content: { display: "flex", flexDirection: "column", height: "100%" },
                body: { padding: "0 4px 0px 4px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 0,height: "100%" },
            }}
        >
            <Stack gap="md" style={{ flex: 1, overflowY: "auto", paddingTop: 12 }}>
                <Select
                    label="Soil Type"
                    placeholder="All soil types"
                    data={SOIL_TYPE_OPTIONS}
                    value={form.values.soilType}
                    onChange={(value) => form.setFieldValue("soilType", value || "all")}
                />

                <Select
                    label="Status"
                    placeholder="All status"
                    data={ACTIVE_STATUS_OPTIONS}
                    value={form.values.isActive}
                    onChange={(value) => form.setFieldValue("isActive", value || "all")}
                />
            </Stack>

            <Group justify="flex-end" mt="md" style={{ position: "sticky", bottom: 0, background: "white", padding: "12px 16px 0 16px", borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                <Button variant="default" onClick={handleClear}>
                    Clear All
                </Button>
                <Button onClick={handleApply}>Apply Filters</Button>
            </Group>
        </Drawer>
    );
}

