"use client";

import { TableFiltersButton } from "@/components/ui";
import type { CropHealthNoteFiltersProps } from "../types";

export function CropHealthNoteFilters({
    onOpenFilters,
}: CropHealthNoteFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

