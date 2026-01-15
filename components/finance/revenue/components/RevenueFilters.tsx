"use client";

import { TableFiltersButton } from "@/components/ui";

interface RevenueFiltersProps {
    onOpenFilters: () => void;
}

export default function RevenueFilters({
    onOpenFilters,
}: RevenueFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

