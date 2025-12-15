"use client";

import { Text } from "@mantine/core";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { IrrigationTableProps, IrrigationRecord } from "../types";

export default function IrrigationTable({
    irrigations,
    pagination,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onPageChange,
}: IrrigationTableProps) {
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

    const columns: BaseTableColumn<IrrigationRecord>[] = [
        {
            key: "fieldName",
            label: "Field",
            render: (irrigation) => (
                <Text fw={500} size="sm" style={nowrap}>
                    {irrigation.fieldName || "N/A"}
                </Text>
            ),
        },
        {
            key: "irrigationDate",
            label: "Date",
            render: (irrigation) => (
                <Text size="sm" style={nowrap}>
                    {formatDate(irrigation.irrigationDate)}
                </Text>
            ),
        },
        {
            key: "irrigationMethod",
            label: "Method",
            render: (irrigation) => (
                <Text size="sm" style={nowrap}>
                    {irrigation.irrigationMethod || (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "waterVolume",
            label: "Water Volume",
            render: (irrigation) => (
                <Text size="sm" style={nowrap}>
                    {irrigation.waterVolume ? (
                        <>
                            {irrigation.waterVolume}{" "}
                            <span style={{ fontSize: "12px", color: "var(--mantine-color-gray-7)" }}>
                                ({irrigation.volumeUnit || ""})
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
            key: "durationMinutes",
            label: "Duration",
            render: (irrigation) => (
                <Text size="sm" style={nowrap}>
                    {irrigation.durationMinutes ? (
                        <>
                            {irrigation.durationMinutes}{" "}
                            <span style={{ fontSize: "12px", color: "var(--mantine-color-gray-7)" }}>
                                (minutes)
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
            key: "cost",
            label: "Cost",
            render: (irrigation) => (
                <Text size="sm" style={nowrap}>
                    {irrigation.cost ? (
                        `$${irrigation.cost}`
                    ) : (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            render: (irrigation) => (
                <Text size="sm" style={nowrap}>
                    {formatDate(irrigation.createdAt)}
                </Text>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (irrigation) => (
                <TableActionButtons
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={() => onUpdate(irrigation)}
                    onDelete={() => onDelete(irrigation)}
                    updateLabel="Edit irrigation"
                    deleteLabel="Delete irrigation"
                    justify="flex-start"
                />
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={irrigations}
            isLoading={isLoading}
            loadingText="Loading irrigation records..."
            emptyState={{
                title: "No Irrigation Records Found",
                description: "You haven't added any irrigation records yet. Start by adding your first irrigation record to track water usage.",
                iconColor: "var(--mantine-color-green-5)",
            }}
            stickyHeader={true}
            minWidth={1000}
            tableLayout="fixed"
            verticalSpacing="sm"
            colgroup={[
                { width: "18%" },
                { width: "12%" },
                { width: "14%" },
                { width: "14%" },
                { width: "12%" },
                { width: "10%" },
                { width: "12%" },
                { width: "120px" },
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
