"use client";

import { TableFiltersButton } from "@/components/ui";
import type { AnimalFiltersProps } from "../types";

export default function AnimalFilters({
    onOpenFilters,
    activeFiltersCount,
}: AnimalFiltersProps) {
    return (
        <TableFiltersButton 
            onOpenFilters={onOpenFilters}
            activeFiltersCount={activeFiltersCount}
        />
    );
}

