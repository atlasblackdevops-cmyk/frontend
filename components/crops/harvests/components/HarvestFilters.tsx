"use client";

import { TableFiltersButton } from "@/components/ui";
import type { HarvestFiltersProps } from "../types";

export default function HarvestFilters({ onOpenFilters }: HarvestFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

