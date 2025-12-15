"use client";

import { Box, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";

interface TableFiltersButtonProps {
    onOpenFilters: () => void;
}

/**
 * Standardized filter button component for table filters.
 * Provides consistent UI across all modules.
 */
export default function TableFiltersButton({
    onOpenFilters,
}: TableFiltersButtonProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
            <Box visibleFrom="sm">
                <Button
                    variant="default"
                    leftSection={<IconFilter size={16} />}
                    onClick={onOpenFilters}
                    radius={6}
                    style={{ alignSelf: 'stretch', height: '42px' }}
                >
                    Filters
                </Button>
            </Box>
            <Box hiddenFrom="sm">
                <Button
                    variant="default"
                    onClick={onOpenFilters}
                    radius={6}
                    style={{ alignSelf: 'stretch', height: '42px', padding: '8px', minWidth: '42px' }}
                    aria-label="Filters"
                >
                    <IconFilter size={16} />
                </Button>
            </Box>
        </div>
    );
}

