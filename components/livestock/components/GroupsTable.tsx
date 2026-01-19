"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconUsersGroup,
  IconWeight,
  IconCalendar,
  IconEdit,
} from "@tabler/icons-react";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import {
  actionButtonStyle,
  actionIconStyle,
  TableActionButtons,
} from "@/components/ui";
import type { AnimalGroup, GroupsTableProps } from "../types";
import { formatDate } from "@/lib/livestock/utils";

export default function GroupsTable({
  groups,
  pagination,
  isLoading,
  canUpdate,
  canDelete,
  onUpdate,
  onDelete,
  onAssignAnimals,
  onPageChange,
}: GroupsTableProps) {
  const formatWeight = (weight: number | null) => {
    if (weight === null) return "N/A";
    return `${weight.toFixed(1)} kg`;
  };

  const formatAge = (age: string | number | null) => {
    if (age === null) return "N/A";
    // If it's already a formatted string from the API, return it as-is
    if (typeof age === "string") {
      return age;
    }
    // If it's a number (in months), format it
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
          <Avatar radius="xl" size={42}>
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
          color="green"
          leftSection={<IconUsersGroup size={14} />}
          size="md"
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
        <TableActionButtons
          canUpdate={canUpdate}
          canDelete={canDelete}
          onUpdate={() => onUpdate(group)}
          onDelete={() => onDelete(group)}
          updateLabel="Edit group"
          deleteLabel="Delete group"
          justify="flex-start"
          customActions={
            <Tooltip label="Assign Animals" position="top" withArrow>
              <Button
                variant="subtle"
                size="md"
                px="xs"
                color="blue"
                style={actionButtonStyle}
                aria-label={"Animal Group"}
                onClick={() => onAssignAnimals(group)}
              >
                <IconUsersGroup size={18} style={actionIconStyle} />
              </Button>
            </Tooltip>
          }
        />
      ),
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={groups}
      isLoading={isLoading}
      loadingText="Loading groups..."
      emptyState={{
        icon: IconUsersGroup,
        title: "No Groups Found",
        description:
          "Create your first animal group to organize your livestock for better management and tracking.",
        iconColor: "var(--mantine-color-green-5)",
      }}
      stickyHeader={true}
      minWidth={800}
      tableLayout="fixed"
      verticalSpacing="sm"
      colgroup={[
        { width: "22%" },
        { width: "10%" },
        { width: "13%" },
        { width: "13%" },
        { width: "14%" },
        { width: "15%" },
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
