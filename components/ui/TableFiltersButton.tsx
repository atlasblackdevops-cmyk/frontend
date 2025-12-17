"use client";

import { Box, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";

interface TableFiltersButtonProps {
    onOpenFilters: () => void;
    activeFiltersCount?: number;
}

export default function TableFiltersButton({
    onOpenFilters,
    activeFiltersCount = 0,
}: TableFiltersButtonProps) {
    const hasActiveFilters = activeFiltersCount > 0;

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
                    {hasActiveFilters && (
                        <span style={{ 
                            marginLeft: '6px', 
                            color: '#2f9e44',
                            fontWeight: 600 
                        }}>
                            ({activeFiltersCount})
                        </span>
                    )}
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

