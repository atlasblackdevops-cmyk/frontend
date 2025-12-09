"use client";

import { Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { CropHealthNoteFiltersProps } from "../types";

export function CropHealthNoteFilters({
    onOpenFilters,
}: CropHealthNoteFiltersProps) {
    return (
        <Button
            variant="light"
            leftSection={<IconFilter size={16} />}
            onClick={onOpenFilters}
        >
            Filters
        </Button>
    );
}

