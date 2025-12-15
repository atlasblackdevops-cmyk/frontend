"use client";

import { Text } from "@mantine/core";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { FertilizerTableProps, FertilizerRecord } from "../types";

export default function FertilizerTable({
    fertilizers,
    pagination,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onPageChange,
}: FertilizerTableProps) {
    const nowrap = { whiteSpace: "nowrap" };
    
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

    const columns: BaseTableColumn<FertilizerRecord>[] = [
        {
            key: "fieldName",
            label: "Field",
            render: (fertilizer) => (
                <Text fw={500} size="sm" style={nowrap}>
                    {fertilizer.fieldName || "N/A"}
                </Text>
            ),
        },
        {
            key: "applicationDate",
            label: "Application Date",
            render: (fertilizer) => (
                <Text size="sm" style={nowrap}>
                    {formatDate(fertilizer.applicationDate)}
                </Text>
            ),
        },
        {
            key: "fertilizerType",
            label: "Type",
            render: (fertilizer) => (
                <Text size="sm" style={nowrap}>
                    {fertilizer.fertilizerType || (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "quantity",
            label: "Quantity",
            render: (fertilizer) => (
                <Text size="sm" style={nowrap}>
                    {fertilizer.quantity ? (
                        <>
                            {fertilizer.quantity}{" "}
                            <span style={{ fontSize: "12px", color: "var(--mantine-color-gray-7)" }}>
                                ({fertilizer.quantityUnit || ""})
                            </span>
                        </>
                    ) : (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "applicationMethod",
            label: "Method",
            render: (fertilizer) => (
                <Text size="sm" tt="capitalize" style={nowrap}>
                    {fertilizer.applicationMethod || (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "cost",
            label: "Cost",
            render: (fertilizer) => (
                <Text size="sm" style={nowrap}>
                    {fertilizer.cost ? (
                        `$${parseFloat(fertilizer.cost).toFixed(2)}`
                    ) : (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "notes",
            label: "Notes",
            render: (fertilizer) => (
                <Text size="sm" c="dimmed" lineClamp={1} style={{ whiteSpace: "nowrap" }}>
                    {fertilizer.notes || "N/A"}
                </Text>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (fertilizer) => (
                <TableActionButtons
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={() => onUpdate(fertilizer)}
                    onDelete={() => onDelete(fertilizer)}
                    updateLabel="Edit fertilizer"
                    deleteLabel="Delete fertilizer"
                    justify="flex-start"
                />
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={fertilizers}
            isLoading={isLoading}
            loadingText="Loading fertilizer records..."
            emptyState={{
                title: "No Fertilizer Records Found",
                description: "You haven't added any fertilizer records yet. Start by adding your first record to track fertilizer applications.",
                iconColor: "var(--mantine-color-green-5)",
            }}
            stickyHeader={true}
            minWidth={1200}
            tableLayout="fixed"
            verticalSpacing="sm"
            colgroup={[
                { width: "15%" }, // Field
                { width: "12%" }, // Application Date
                { width: "15%" }, // Type
                { width: "12%" }, // Quantity
                { width: "12%" }, // Method
                { width: "10%" }, // Cost
                { width: "18%" }, // Notes
                { width: "110px" }, // Actions
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

