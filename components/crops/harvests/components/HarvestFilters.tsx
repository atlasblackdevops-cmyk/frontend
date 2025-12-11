"use client";

import { Button, Group } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { HarvestFiltersProps } from "../types";

export default function HarvestFilters({ onOpenFilters }: HarvestFiltersProps) {
    return (
        <Group gap="md" wrap="nowrap">
            <Button
                variant="outline"
                leftSection={<IconFilter size={16} />}
                onClick={onOpenFilters}
            >
                Filters
            </Button>
        </Group>
    );
}

