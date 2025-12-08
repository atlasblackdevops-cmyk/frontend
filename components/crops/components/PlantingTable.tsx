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
import type { PlantingTableProps } from "../types";

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

    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
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
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "16%" }} />
                </colgroup>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Field</Table.Th>
                        <Table.Th>Crop</Table.Th>
                        <Table.Th>Seed Type</Table.Th>
                        <Table.Th>Planting Date</Table.Th>
                        <Table.Th>Expected Harvest</Table.Th>
                        <Table.Th>Area</Table.Th>
                        <Table.Th
                            style={{
                                textAlign: "right",
                            }}
                        >
                            Actions
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {isLoading ? (
                        <Table.Tr>
                            <Table.Td colSpan={8}>
                                <Group justify="center" p="xl">
                                    <Loader size="sm" />
                                    <Text c="dimmed">Loading plantings...</Text>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ) : plantings.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={8}>
                                <Text c="dimmed" ta="center" p="xl">
                                    No plantings found. Add your first planting record!
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        plantings.map((planting) => (
                            <Table.Tr key={planting.id}>
                                <Table.Td>
                                    <Text fw={500} size="sm">
                                        {planting.fieldName || "N/A"}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{planting.crop}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {planting.seedType}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">
                                        {formatDate(planting.plantingDate)}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {formatDate(planting.expectedHarvestDate)}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    {planting.area ? (
                                        <Text size="sm">
                                            {planting.area} {planting.areaUnit || ""}
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed">
                                            N/A
                                        </Text>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Group justify="flex-end" gap="xs">
                                        {canUpdate && (
                                            <Button
                                                variant="subtle"
                                                size="xs"
                                                leftSection={<IconEdit size={14} />}
                                                onClick={() => onUpdate(planting)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                variant="subtle"
                                                color="red"
                                                size="xs"
                                                leftSection={<IconTrash size={14} />}
                                                onClick={() => onDelete(planting)}
                                            >
                                                Delete
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

