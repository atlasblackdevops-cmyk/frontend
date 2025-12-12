"use client";

import {
    Badge,
    Button,
    Group,
    Text,
} from "@mantine/core";
import { IconEdit, IconTrash, IconMapPin } from "@tabler/icons-react";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
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
    const actionButtonStyle = {
        minWidth: 36,
        minHeight: 32,
        paddingLeft: 8,
        paddingRight: 8,
        flexShrink: 0,
    };
    const actionIconStyle = { width: 18, height: 18, flexShrink: 0 };
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
                <Group justify="flex-start" gap="1" wrap="nowrap">
                    {canUpdate && (
                        <Button
                            variant="subtle"
                            size="md"
                            px="xs"
                            style={actionButtonStyle}
                            aria-label="Edit field"
                            onClick={() => onUpdate(field)}
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
                            aria-label="Delete field"
                            onClick={() => onDelete(field)}
                        >
                            <IconTrash size={18} style={actionIconStyle} />
                        </Button>
                    )}
                </Group>
            ),
        },
    ];

    return (
        <div style={{ 
            width: "100%", 
            position: "relative",
            border: "1px solid var(--mantine-color-gray-3)",
            borderRadius: 6,
            overflow: "auto",
            maxHeight: "100%"
        }}>
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
        </div>
    );
}

