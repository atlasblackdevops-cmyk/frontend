"use client";

import { TableFiltersButton } from "@/components/ui";

interface ExpenseFiltersProps {
    onOpenFilters: () => void;
}

export default function ExpenseFilters({
    onOpenFilters,
}: ExpenseFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

