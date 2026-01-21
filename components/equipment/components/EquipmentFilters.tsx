"use client";

import { TableFiltersButton } from "@/components/ui";
import type { EquipmentFiltersProps } from "../types";

export default function EquipmentFilters({
    onOpenFilters,
    activeFiltersCount,
}: EquipmentFiltersProps) {
    return (
        <TableFiltersButton 
            onOpenFilters={onOpenFilters}
            activeFiltersCount={activeFiltersCount}
        />
    );
}

