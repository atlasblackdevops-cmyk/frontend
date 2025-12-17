"use client";

import { Text } from "@mantine/core";
import { IconPlant } from "@tabler/icons-react";
import BaseTable, { BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { PlantingTableProps, PlantingRecord } from "../types";

export default function PlantingTable({
    plantings,
    pagination,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onPageChange,
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


    const columns: BaseTableColumn<PlantingRecord>[] = [
        {
            key: "fieldName",
            label: "Field",
            width: "15%",
            render: (planting) => (
                <Text fw={500} size="sm" lineClamp={1} title={planting.fieldName || "N/A"}>
                    {planting.fieldName || "N/A"}
                </Text>
            ),
        },
        {
            key: "crop",
            label: "Crop",
            width: "15%",
            render: (planting) => (
                <Text size="sm" lineClamp={1} title={planting.crop}>
                    {planting.crop}
                </Text>
            ),
        },
        {
            key: "seedType",
            label: "Seed Type",
            width: "15%",
            render: (planting) => (
                <Text size="sm" c="dimmed" lineClamp={1} title={planting.seedType}>
                    {planting.seedType}
                </Text>
            ),
        },
        {
            key: "plantingDate",
            label: "Planting Date",
            width: "12%",
            render: (planting) => (
                <Text size="sm" lineClamp={1}>
                    {formatDate(planting.plantingDate)}
                </Text>
            ),
        },
        {
            key: "expectedHarvestDate",
            label: "Expected Harvest",
            width: "12%",
            render: (planting) => (
                <Text size="sm" c="dimmed" lineClamp={1}>
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
                    <Text size="sm" lineClamp={1} title={`${planting.area} ${planting.areaUnit || ""}`}>
                        {planting.area} {planting.areaUnit || ""}
                    </Text>
                ) : (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                        N/A
                    </Text>
                )
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "100px",
            render: (planting) => (
                <TableActionButtons
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={() => onUpdate(planting)}
                    onDelete={() => onDelete(planting)}
                    updateLabel="Edit planting"
                    deleteLabel="Delete planting"
                />
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
            tableLayout="fixed"
            verticalSpacing="sm"
            colgroup={[
                { width: "15%" }, { width: "15%" }, { width: "15%" }, { width: "12%" }, { width: "12%" }, { width: "15%" }, { width: "16%" }
            ]}
            pagination={
                pagination
                    ? {
                          page: pagination.page,
                          totalPages: pagination.totalPages,
                          onPageChange: onPageChange ?? (() => {}),
                      }
                    : undefined
            }
        />
    );
}

