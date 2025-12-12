"use client";

import {
    Group,
    Loader,
    Pagination,
    Skeleton,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { IconDatabaseExclamation } from "@tabler/icons-react";
import { ReactNode } from "react";

export interface BaseTableColumn<T = any> {
    key: string;
    label: string;
    width?: string | number;
    render?: (item: T, index: number) => ReactNode;
}

export interface BaseTableProps<T = any> {
    columns: BaseTableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    emptyState?: {
        icon?: React.ComponentType<{ size?: number; stroke?: number; style?: React.CSSProperties }>;
        title?: string;
        description?: string;
        iconColor?: string;
        iconSize?: number;
    };
    loadingText?: string;
    getRowKey?: (item: T, index: number) => string | number;
    stickyHeader?: boolean;
    minWidth?: number;
    tableLayout?: "auto" | "fixed";
    verticalSpacing?: "xs" | "sm" | "md" | "lg" | "xl";
    highlightOnHover?: boolean;
    colgroup?: Array<{ width?: string | number }>;
    pagination?: {
        page: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

export default function BaseTable<T = any>({
    columns,
    data,
    isLoading = false,
    emptyState,
    loadingText = "Loading...",
    getRowKey = (item: T, index: number) => (item as any)?.id ?? index,
    stickyHeader = false,
    minWidth = 900,
    tableLayout = "fixed",
    verticalSpacing = "sm",
    highlightOnHover = true,
    colgroup,
    pagination,
}: BaseTableProps<T>) {
    const EmptyIcon = emptyState?.icon || IconDatabaseExclamation;
    const iconColor = emptyState?.iconColor || "var(--mantine-color-gray-5)";
    const iconSize = emptyState?.iconSize || 64;
    const emptyTitle = emptyState?.title || "No Data Found";
    const emptyDescription = emptyState?.description || "No items to display.";

    return (
        <div style={{ width: "100%", position: "relative" }}>
            <Table
                verticalSpacing={verticalSpacing}
                highlightOnHover={highlightOnHover}
                style={{
                    width: "100%",
                    minWidth,
                    tableLayout,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                }}
            >
                {colgroup && (
                    <colgroup>
                        {colgroup.map((col, index) => {
                            const width =  (col.width || undefined);
                            return (
                                <col 
                                    key={index} 
                                    style={ { 
                                        width: width, 
                                        boxSizing: 'border-box'
                                    }} 
                                />
                            );
                        })}
                    </colgroup>
                )}
                <Table.Thead
                    style={{
                        backgroundColor: "var(--mantine-color-gray-2)",
                        position: stickyHeader ? "sticky" : "static",
                        top: stickyHeader ? 0 : "auto",
                        zIndex: stickyHeader ? 100 : "auto",
                        boxShadow: stickyHeader ? "0 2px 4px rgba(0, 0, 0, 0.05)" : "none",
                    }}
                >
                    <Table.Tr>
                        {columns.map((column, colIndex) => {
                            const width =  column.width;
                            return (
                                <Table.Th
                                    key={column.key}
                                    style={{
                                        whiteSpace: "nowrap",
                                        backgroundColor: "var(--mantine-color-gray-2)",
                                            width: width, 
                                            boxSizing: 'border-box'
                                    }}
                                >
                                    {column.label}
                                </Table.Th>
                            );
                        })}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <Table.Tr key={`skeleton-${index}`}>
                                {columns.map((column) => (
                                    <Table.Td key={column.key}>
                                        <Skeleton height={20} radius="sm" />
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        ))
                    ) : data.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={columns.length}>
                                <Stack align="center" gap="md" p="xl">
                                    <div
                                        style={{
                                            position: "relative",
                                            width: 120,
                                            height: 120,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {/* Background circle */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "50%",
                                                background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                                                opacity: 0.8,
                                            }}
                                        />
                                        {/* Icon */}
                                        <EmptyIcon
                                            size={iconSize}
                                            stroke={1.5}
                                            style={{
                                                position: "relative",
                                                zIndex: 1,
                                                color: iconColor,
                                            }}
                                        />
                                    </div>
                                    <Stack gap="xs" align="center" style={{ maxWidth: 400 }}>
                                        <Text
                                            size="lg"
                                            fw={600}
                                            c="dark"
                                            ta="center"
                                        >
                                            {emptyTitle}
                                        </Text>
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            ta="center"
                                            style={{ lineHeight: 1.6 }}
                                        >
                                            {emptyDescription}
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        data.map((item, index) => (
                            <Table.Tr 
                                key={getRowKey(item, index)}
                                style={{
                                    backgroundColor: index % 2 === 0 ? "var(--mantine-color-white)" : "var(--mantine-color-gray-0)",
                                }}
                            >
                                {columns.map((column, colIndex) => {
                                    const isActionColumn = column.key === "actions";
                                    const width =  column.width;
                                    return (
                                        <Table.Td 
                                            key={column.key}
                                            style={{
                                                paddingTop: isActionColumn ? 4 : 6,
                                                paddingBottom: isActionColumn ? 4 : 6,
                                                paddingLeft: isActionColumn ? 2 : 16,
                                                paddingRight: isActionColumn ? 2 : 16,
                                                backgroundColor: "transparent",
                                                    width: width, 
                                                    boxSizing: 'border-box'
                                            }}
                                        >
                                            {column.render
                                                ? column.render(item, index)
                                                : (item as any)[column.key]}
                                        </Table.Td>
                                    );
                                })}
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
            {pagination  && (
                <Group 
                    justify="center" 
                    style={{ 
                        paddingTop: 16,
                        paddingBottom: 16,
                    }}
                >
                    <Pagination
                        value={pagination.page}
                        onChange={pagination.onPageChange}
                        total={pagination.totalPages}
                        size="md"
                    />
                </Group>
            )}
        </div>
    );
}

