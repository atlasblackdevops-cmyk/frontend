"use client";

import { TableFiltersButton } from "@/components/ui";

interface UserFiltersProps {
    onOpenFilters: () => void;
}

export default function UserFilters({
    onOpenFilters,
}: UserFiltersProps) {
    return <TableFiltersButton onOpenFilters={onOpenFilters} />;
}

