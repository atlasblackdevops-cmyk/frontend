"use client";

import { Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { PlantingFiltersProps } from "../types";

export default function PlantingFilters({
    onOpenFilters,
}: PlantingFiltersProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <Button
                variant="default"
                leftSection={<IconFilter size={16} />}
                onClick={onOpenFilters}
                style={{ alignSelf: 'stretch',height:'36px' }}
            >
                Filters
            </Button>
        </div>
    );
}

