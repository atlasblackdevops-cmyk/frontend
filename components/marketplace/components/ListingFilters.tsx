"use client";

import { Badge, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { ListingFiltersProps } from "../types";

export default function ListingFilters({
  onOpenFilters,
  activeFiltersCount = 0,
}: ListingFiltersProps) {
  return (
    <Button
      variant="light"
      leftSection={<IconFilter size={16} />}
      onClick={onOpenFilters}
    >
      Filters
      {activeFiltersCount > 0 && (
        <Badge
          size="sm"
          variant="filled"
          color="blue"
          ml="xs"
          style={{ minWidth: 20, height: 20 }}
        >
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );
}

