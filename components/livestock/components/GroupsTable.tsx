"use client";

import {
    Avatar,
    Badge,
    Button,
    Group,
    Loader,
    Stack,
    Table,
    Text,
    Tooltip,
    ActionIcon,
} from "@mantine/core";
import {
    IconEdit,
    IconTrash,
    IconUsersGroup,
    IconWeight,
    IconCalendar,
} from "@tabler/icons-react";
import type { AnimalGroup } from "../types";
import { formatDate } from "@/lib/livestock/utils";

interface GroupsTableProps {
    groups: AnimalGroup[];
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpdate: (group: AnimalGroup) => void;
    onDelete: (group: AnimalGroup) => void;
    onAssignAnimals: (group: AnimalGroup) => void;
}

export default function GroupsTable({
    groups,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onAssignAnimals,
}: GroupsTableProps) {
    const formatWeight = (weight: number | null) => {
        if (weight === null) return "N/A";
        return `${weight.toFixed(1)} kg`;
    };

    const formatAge = (age: number | null) => {
        if (age === null) return "N/A";
        const years = Math.floor(age / 12);
        const months = Math.floor(age % 12);
        if (years > 0 && months > 0) {
            return `${years}y ${months}m`;
        } else if (years > 0) {
            return `${years}y`;
        } else {
            return `${months}m`;
        }
    };

    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <Table
                verticalSpacing="sm"
                highlightOnHover
                style={{
                    width: "100%",
                    minWidth: 800,
                    tableLayout: "fixed",
                }}
            >
                <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "20%" }} />
                </colgroup>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Group Name</Table.Th>
                        <Table.Th>Animals</Table.Th>
                        <Table.Th>Avg Weight</Table.Th>
                        <Table.Th>Avg Age</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th style={{ textAlign: "center" }}>
                            Actions
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {isLoading ? (
                        <Table.Tr>
                            <Table.Td colSpan={6}>
                                <Group justify="center" p="xl">
                                    <Loader size="sm" />
                                    <Text c="dimmed">Loading groups...</Text>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ) : groups.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={6}>
                                <Group justify="center" p="xl">
                                    <IconUsersGroup size={48} color="gray" />
                                    <Stack gap="xs" align="center">
                                        <Text c="dimmed" ta="center" fw={500}>
                                            No groups found
                                        </Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            Create your first animal group to
                                            organize your livestock
                                        </Text>
                                    </Stack>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        groups.map((group) => (
                            <Table.Tr key={group.id}>
                                <Table.Td>
                                    <Group gap="sm">
                                        <Avatar
                                            radius="xl"
                                            size={42}
                                            color="blue"
                                        >
                                            <IconUsersGroup size={20} />
                                        </Avatar>
                                        <div>
                                            <Text fw={600}>{group.name}</Text>
                                            {group.description && (
                                                <Text size="xs" c="dimmed" lineClamp={1}>
                                                    {group.description}
                                                </Text>
                                            )}
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Badge
                                            variant="light"
                                            color="blue"
                                            leftSection={<IconUsersGroup size={14} />}
                                            size="lg"
                                        >
                                            {group.animalCount} animals
                                        </Badge>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconWeight size={16} color="gray" />
                                        <Text size="sm">
                                            {formatWeight(group.averageWeight)}
                                        </Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconCalendar size={16} color="gray" />
                                        <Text size="sm">
                                            {formatAge(group.averageAge)}
                                        </Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {formatDate(group.createdAt)}
                                    </Text>
                                </Table.Td>
                                <Table.Td style={{ textAlign: "center" }}>
                                    <Group gap="xs" justify="center">
                                        <Button
                                            variant="filled"
                                            color="blue"
                                            size="sm"
                                            leftSection={<IconUsersGroup size={16} />}
                                            onClick={() => onAssignAnimals(group)}
                                        >
                                            Assign Animals
                                        </Button>
                                        {canUpdate && (
                                            <Tooltip label="Edit Group">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    onClick={() =>
                                                        onUpdate(group)
                                                    }
                                                >
                                                    <IconEdit size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {canDelete && (
                                            <Tooltip label="Delete Group">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={() =>
                                                        onDelete(group)
                                                    }
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
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

