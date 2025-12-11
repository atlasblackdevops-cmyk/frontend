"use client";

import { Button, Group, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import BaseTable, { BaseTableColumn } from "@/components/ui/BaseTable";
import type { HarvestTableProps, HarvestRecord } from "../types";

export default function HarvestTable({
    harvests,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
}: HarvestTableProps) {
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

    const columns: BaseTableColumn<HarvestRecord>[] = [
        {
            key: "fieldName",
            label: "Field",
            width: "12%",
            render: (harvest) => (
                <Text fw={500} size="sm">
                    {harvest.fieldName || "N/A"}
                </Text>
            ),
        },
        {
            key: "cropType",
            label: "Crop Type",
            width: "12%",
            render: (harvest) => (
                <Text size="sm" fw={500}>{harvest.cropType}</Text>
            ),
        },
        {
            key: "harvestDate",
            label: "Harvest Date",
            width: "12%",
            render: (harvest) => (
                <Text size="sm">
                    {formatDate(harvest.harvestDate)}
                </Text>
            ),
        },
        {
            key: "yieldAmount",
            label: "Yield",
            width: "15%",
            render: (harvest) => (
                <Text size="sm" fw={600} c="green">
                    {harvest.yieldAmount.toLocaleString()} {harvest.yieldUnit}
                </Text>
            ),
        },
        {
            key: "plantingRecord",
            label: "Planting",
            width: "12%",
            render: (harvest) => (
                harvest.plantingRecord ? (
                    <Text size="sm" c="dimmed">
                        {harvest.plantingRecord.crop}
                    </Text>
                ) : (
                    <Text size="sm" c="dimmed">
                        —
                    </Text>
                )
            ),
        },
        {
            key: "notes",
            label: "Notes",
            width: "25%",
            render: (harvest) => (
                <Text size="sm" c="dimmed" lineClamp={1}>
                    {harvest.notes || "—"}
                </Text>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "12%",
            render: (harvest) => (
                <Group gap={4} wrap="nowrap">
                    {canUpdate && (
                        <Button
                            variant="subtle"
                            color="blue"
                            size="xs"
                            px={8}
                            style={actionButtonStyle}
                            onClick={() => onUpdate(harvest)}
                            leftSection={<IconEdit size={14} />}
                        >
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            px={8}
                            style={actionButtonStyle}
                            onClick={() => onDelete(harvest)}
                            leftSection={<IconTrash size={14} />}
                        >
                            Delete
                        </Button>
                    )}
                </Group>
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={harvests}
            isLoading={isLoading}
            emptyState={{
                title: "No Harvest Records Found",
                description: "You haven't added any harvest records yet. Start by adding your first harvest record to track yield performance.",
            }}
            stickyHeader={true}
            minWidth={1000}
        />
    );
}

