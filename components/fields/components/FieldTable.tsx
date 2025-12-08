"use client";

import {
    Badge,
    Button,
    Group,
    Loader,
    Table,
    Text,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { FieldTableProps } from "../types";

export default function FieldTable({
    fields,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
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

    return (
        <div style={{ width: "100%", height: "100%", overflow: "auto", position: "relative" }}>
            <Table
                verticalSpacing="sm"
                highlightOnHover
                style={{
                    width: "100%",
                    minWidth: 900,
                    tableLayout: "fixed",
                }}
            >
                <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "120px" }} />
                </colgroup>
                <Table.Thead 
                    style={{ 
                        backgroundColor: "var(--mantine-color-gray-0)",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <Table.Tr>
                        <Table.Th 
                            style={{
                                ...nowrap,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Field Name
                        </Table.Th>
                        <Table.Th 
                            style={{
                                ...nowrap,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Size
                        </Table.Th>
                        <Table.Th 
                            style={{
                                ...nowrap,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Soil Type
                        </Table.Th>
                        <Table.Th 
                            style={{
                                ...nowrap,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Status
                        </Table.Th>
                        <Table.Th 
                            style={{
                                ...nowrap,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Created
                        </Table.Th>
                        <Table.Th 
                            style={{
                                ...nowrap,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Notes
                        </Table.Th>
                        <Table.Th 
                            style={{ 
                                ...nowrap, 
                                paddingLeft: 24, 
                                paddingRight: 12,
                                backgroundColor: "var(--mantine-color-gray-0)",
                            }}
                        >
                            Actions
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {isLoading ? (
                        <Table.Tr>
                            <Table.Td colSpan={7}>
                                <Group justify="center" p="xl">
                                    <Loader size="sm" />
                                    <Text c="dimmed">Loading fields...</Text>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ) : fields.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={7}>
                                <Text c="dimmed" ta="center" p="xl">
                                    No fields found. Add your first field!
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        fields.map((field) => (
                            <Table.Tr key={field.id}>
                                <Table.Td style={nowrap}>
                                    <Text fw={500} size="sm">
                                        {field.fieldName}
                                    </Text>
                                </Table.Td>
                                <Table.Td style={nowrap}>
                                    {field.fieldSize ? (
                                        <Text size="sm" tt="capitalize">
                                            {field.fieldSize} <span style={{ fontSize: "12px", color: "var(--mantine-color-gray-7)" }}>({field.sizeUnit || ""})</span>
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            N/A
                                        </Text>
                                    )}
                                </Table.Td>
                                <Table.Td style={nowrap}>
                                {field.soilType ? (
                                        <Text size="sm" tt="capitalize">
                                             {field.soilType || "N/A"}
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            N/A
                                        </Text>
                                    )}
                                   
                                </Table.Td>
                                <Table.Td style={nowrap}>
                                    <Badge
                                        color={field.isActive ? "green" : "gray"}
                                        variant="light"
                                        size="sm"
                                    >
                                        {field.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </Table.Td>
                                <Table.Td style={nowrap}>
                                    <Text size="sm">
                                        {formatDate(field.createdAt)}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed" lineClamp={1} style={{ whiteSpace: "nowrap" }}>
                                        {field.notes || "N/A"}
                                    </Text>
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        ...nowrap,
                                        textAlign: "center",
                                        paddingRight: 12,
                                        paddingLeft: 12,
                                    }}
                                >
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
                                </Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
        </div>
    );
}

