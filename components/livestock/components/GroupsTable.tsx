"use client";

import {
    Avatar,
    Badge,
    Button,
    Group,
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
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import type { AnimalGroup, GroupsTableProps } from "../types";
import { formatDate } from "@/lib/livestock/utils";

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

    const columns: BaseTableColumn<AnimalGroup>[] = [
        {
            key: "name",
            label: "Group Name",
            render: (group) => (
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
            ),
        },
        {
            key: "animalCount",
            label: "Animals",
            render: (group) => (
                <Badge
                    variant="light"
                    color="blue"
                    leftSection={<IconUsersGroup size={14} />}
                    size="lg"
                >
                    {group.animalCount} animals
                </Badge>
            ),
        },
        {
            key: "averageWeight",
            label: "Avg Weight",
            render: (group) => (
                <Group gap="xs">
                    <IconWeight size={16} color="gray" />
                    <Text size="sm">{formatWeight(group.averageWeight)}</Text>
                </Group>
            ),
        },
        {
            key: "averageAge",
            label: "Avg Age",
            render: (group) => (
                <Group gap="xs">
                    <IconCalendar size={16} color="gray" />
                    <Text size="sm">{formatAge(group.averageAge)}</Text>
                </Group>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            render: (group) => (
                <Text size="sm" c="dimmed">
                    {formatDate(group.createdAt)}
                </Text>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (group) => (
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
                                onClick={() => onUpdate(group)}
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
                                onClick={() => onDelete(group)}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Tooltip>
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
                data={groups}
                isLoading={isLoading}
                loadingText="Loading groups..."
                emptyState={{
                    icon: IconUsersGroup,
                    title: "No Groups Found",
                    description: "Create your first animal group to organize your livestock for better management and tracking.",
                    iconColor: "var(--mantine-color-green-5)",
                }}
                stickyHeader={true}
                minWidth={800}
                tableLayout="fixed"
                verticalSpacing="sm"
                colgroup={[
                    { width: "22%" },
                    { width: "18%" },
                    { width: "13%" },
                    { width: "13%" },
                    { width: "14%" },
                    { width: "20%" },
                ]}
            />
        </div>
    );
}

