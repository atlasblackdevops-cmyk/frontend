"use client";

import {
    Badge,
    Text,
} from "@mantine/core";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { FieldTableProps, FieldRecord } from "../types";

export default function FieldTable({
    fields,
    pagination,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onPageChange,
}: FieldTableProps) {
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

    const columns: BaseTableColumn<FieldRecord>[] = [
        {
            key: "fieldName",
            label: "Field Name",
            render: (field) => (
                <Text fw={500} size="sm" style={nowrap}>
                    {field.fieldName}
                </Text>
            ),
        },
        {
            key: "fieldSize",
            label: "Size",
            render: (field) => (
                <Text size="sm" style={nowrap}>
                    {field.fieldSize ? (
                        <>
                            {field.fieldSize}{" "}
                            <span style={{ fontSize: "12px", color: "var(--mantine-color-gray-7)" }}>
                                ({field.sizeUnit || ""})
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
            key: "soilType",
            label: "Soil Type",
            render: (field) => (
                <Text size="sm" tt="capitalize" style={nowrap}>
                    {field.soilType || (
                        <Text size="sm" c="dimmed" component="span">
                            N/A
                        </Text>
                    )}
                </Text>
            ),
        },
        {
            key: "isActive",
            label: "Status",
            render: (field) => (
                <Badge
                    color={field.isActive ? "green" : "gray"}
                    variant="light"
                    size="sm"
                    style={nowrap}
                >
                    {field.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            render: (field) => (
                <Text size="sm" style={nowrap}>
                    {formatDate(field.createdAt)}
                </Text>
            ),
        },
        {
            key: "notes",
            label: "Notes",
            render: (field) => (
                <Text size="sm" c="dimmed" lineClamp={1} style={{ whiteSpace: "nowrap" }}>
                    {field.notes || "N/A"}
                </Text>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (field) => (
                <TableActionButtons
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={() => onUpdate(field)}
                    onDelete={() => onDelete(field)}
                    updateLabel="Edit field"
                    deleteLabel="Delete field"
                    justify="flex-start"
                />
            ),
        },
    ];

    return (
        <BaseTable
                columns={columns}
                data={fields}
                isLoading={isLoading}
                loadingText="Loading fields..."
                emptyState={{
                    title: "No Fields Found",
                    description: "You haven't added any fields yet. Start by adding your first field to track and manage your farm's land.",
                    iconColor: "var(--mantine-color-green-5)",
                }}
                stickyHeader={true}
                minWidth={900}
                tableLayout="fixed"
                verticalSpacing="sm"
                colgroup={[
                    { width: "22%" },
                    { width: "14%" },
                    { width: "14%" },
                    { width: "10%" },
                    { width: "12%" },
                    { width: "18%" },
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

