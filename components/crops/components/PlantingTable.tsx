"use client";

import { Button, Group, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconPlant } from "@tabler/icons-react";
import BaseTable, { BaseTableColumn } from "@/components/ui/BaseTable";
import type { PlantingTableProps, PlantingRecord } from "../types";

export default function PlantingTable({
    plantings,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
}: PlantingTableProps) {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const actionButtonStyle = {
        padding: "4px 8px",
        minHeight: "auto",
    };

    const actionIconStyle = {
        marginRight: "4px",
    };

    const columns: BaseTableColumn<PlantingRecord>[] = [
        {
            key: "fieldName",
            label: "Field",
            width: "15%",
            render: (planting) => (
                <Text fw={500} size="sm">
                    {planting.fieldName || "N/A"}
                </Text>
            ),
        },
        {
            key: "crop",
            label: "Crop",
            width: "15%",
            render: (planting) => (
                <Text size="sm">{planting.crop}</Text>
            ),
        },
        {
            key: "seedType",
            label: "Seed Type",
            width: "15%",
            render: (planting) => (
                <Text size="sm" c="dimmed">
                    {planting.seedType}
                </Text>
            ),
        },
        {
            key: "plantingDate",
            label: "Planting Date",
            width: "12%",
            render: (planting) => (
                <Text size="sm">
                    {formatDate(planting.plantingDate)}
                </Text>
            ),
        },
        {
            key: "expectedHarvestDate",
            label: "Expected Harvest",
            width: "12%",
            render: (planting) => (
                <Text size="sm" c="dimmed">
                    {formatDate(planting.expectedHarvestDate)}
                </Text>
            ),
        },
        {
            key: "area",
            label: "Area",
            width: "15%",
            render: (planting) => (
                planting.area ? (
                    <Text size="sm">
                        {planting.area} {planting.areaUnit || ""}
                    </Text>
                ) : (
                    <Text size="sm" c="dimmed">
                        N/A
                    </Text>
                )
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "16%",
            render: (planting) => (
                <Group justify="flex-end" gap="xs" wrap="nowrap">
                    {canUpdate && (
                        <Button
                            variant="subtle"
                            size="md"
                            px="xs"
                            style={actionButtonStyle}
                            aria-label="Edit planting"
                            onClick={() => onUpdate(planting)}
                        >
                            <IconEdit size={18} style={actionIconStyle} />
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="subtle"
                            color="red"
                            size="md"
                            px="xs"
                            style={actionButtonStyle}
                            aria-label="Delete planting"
                            onClick={() => onDelete(planting)}
                        >
                            <IconTrash size={18} style={actionIconStyle} />
                        </Button>
                    )}
                </Group>
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={plantings}
            isLoading={isLoading}
            emptyState={{
                icon: IconPlant,
                title: "No Planting Records Found",
                description: "You haven't added any planting records yet. Start by adding your first planting record to track crops in your fields.",
                iconColor: "var(--mantine-color-green-5)",
            }}
            stickyHeader={true}
            minWidth={900}
            colgroup={[
                { width: "15%" }, { width: "15%" }, { width: "15%" }, { width: "12%" }, { width: "12%" }, { width: "15%" }, { width: "16%" }
            ]}
        />
    );
}

