"use client";

import { TableFiltersButton } from "@/components/ui";

export default function FertilizerFilters({ onOpenFilters }: { onOpenFilters: () => void }) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

