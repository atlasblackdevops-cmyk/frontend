"use client";

import { TableFiltersButton } from "@/components/ui";
import type { FieldFiltersProps } from "../types";

export default function FieldFilters({
    onOpenFilters,
}: FieldFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

