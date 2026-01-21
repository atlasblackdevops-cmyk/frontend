"use client";

import { useEffect } from "react";
import { Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { TableFiltersDrawer } from "@/components/ui";
import type { FilterValues, EquipmentFiltersDrawerProps } from "../types";
import { EQUIPMENT_STATUS_OPTIONS, EQUIPMENT_TYPE_OPTIONS } from "../types";

export default function EquipmentFiltersDrawer({
    opened,
    onClose,
    filters,
    onApplyFilters,
    onClearFilters,
}: EquipmentFiltersDrawerProps) {
    const form = useForm<Omit<FilterValues, "search">>({
        initialValues: {
            equipmentType: filters.equipmentType,
            status: filters.status,
        },
    });

    // Reset form to current filters when drawer opens or filters change
    useEffect(() => {
        if (opened) {
            form.setValues({
                equipmentType: filters.equipmentType,
                status: filters.status,
            });
        }
    }, [opened, filters.equipmentType, filters.status]);

    const handleApply = () => {
        onApplyFilters({
            ...form.values,
            search: filters.search, // Keep search value from parent
        });
        onClose();
    };

    const handleClear = () => {
        form.setValues({
            equipmentType: "all",
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
                label="Equipment Type"
                placeholder="Select type"
                data={EQUIPMENT_TYPE_OPTIONS}
                {...form.getInputProps("equipmentType")}
            />

            <Select
                label="Status"
                placeholder="Select status"
                data={EQUIPMENT_STATUS_OPTIONS}
                {...form.getInputProps("status")}
            />
        </TableFiltersDrawer>
    );
}

