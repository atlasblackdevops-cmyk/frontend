"use client";

import { Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { FieldFiltersProps } from "../types";

export default function FieldFilters({
    onOpenFilters,
}: FieldFiltersProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <Button
                variant="default"
                leftSection={<IconFilter size={16} />}
                onClick={onOpenFilters}
                radius={6}
                style={{ alignSelf: 'stretch', height: '42px' }}
            >
                Filters
            </Button>
        </div>
    );
}

