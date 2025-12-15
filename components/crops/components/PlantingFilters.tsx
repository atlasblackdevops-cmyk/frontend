"use client";

import { TableFiltersButton } from "@/components/ui";
import type { PlantingFiltersProps } from "../types";

export default function PlantingFilters({
    onOpenFilters,
}: PlantingFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

