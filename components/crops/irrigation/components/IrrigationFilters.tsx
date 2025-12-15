"use client";

import { TableFiltersButton } from "@/components/ui";
import type { IrrigationFiltersProps } from "../types";

export default function IrrigationFilters({
    onOpenFilters,
}: IrrigationFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

