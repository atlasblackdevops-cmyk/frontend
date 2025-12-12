"use client";

import { Avatar, Badge, Button, Group, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconDeer } from "@tabler/icons-react";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import type { AnimalRecord, AnimalTableProps } from "../types";
import { formatDate } from "@/lib/livestock/utils";
import AnimalActionsMenu from "./AnimalActionsMenu";

export default function AnimalTable({
  animals,
  pagination,
  isLoading,
  canUpdate,
  canDelete,
  onUpdate,
  onDelete,
  onOpenHealthRecords,
  onOpenWeightRecords,
  onOpenFeedRecords,
  onPageChange,
}: AnimalTableProps) {
  const columns: BaseTableColumn<AnimalRecord>[] = [
    {
      key: "animal",
      label: "Animal",
      render: (animal) => (
        <Group gap="sm">
          <Avatar src={animal.photo} radius="xl" size={28}>
            {!animal.photo && animal.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text fw={600}>{animal.name}</Text>
          </div>
        </Group>
      ),
    },
    {
      key: "species",
      label: "Species",
      render: (animal) => <Text size="sm">{animal.species}</Text>,
    },
    {
      key: "breed",
      label: "Breed",
      render: (animal) => <Text size="sm">{animal.breed}</Text>,
    },
    {
      key: "gender",
      label: "Sex",
      render: (animal) => (
        <Badge
          color={
            animal.gender === "Female"
              ? "pink"
              : animal.gender === "Male"
                ? "blue"
                : "gray"
          }
        >
          {animal.gender}
        </Badge>
      ),
    },
    {
      key: "birthdate",
      label: "Birthdate",
      render: (animal) => <Text size="sm">{formatDate(animal.birthdate)}</Text>,
    },
    {
      key: "actions",
      label: "Actions",
      width: "150px",
      render: (animal) => {
        const actionButtonStyle = {
          minWidth: 36,
          minHeight: 32,
          paddingLeft: 8,
          paddingRight: 8,
          flexShrink: 0,
        };
        const actionIconStyle = { width: 18, height: 18, flexShrink: 0 };

        return (
          <Group justify="flex-start" gap="1" wrap="nowrap">
            {canUpdate && (
              <Button
                variant="subtle"
                size="md"
                px="xs"
                style={actionButtonStyle}
                aria-label="Edit animal"
                onClick={() => onUpdate(animal)}
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
                aria-label="Delete animal"
                onClick={() => onDelete(animal)}
              >
                <IconTrash size={18} style={actionIconStyle} />
              </Button>
            )}
            <AnimalActionsMenu
              animal={animal}
              onOpenHealthRecords={() => onOpenHealthRecords(animal)}
              onOpenWeightRecords={() => onOpenWeightRecords(animal)}
              onOpenFeedRecords={() => onOpenFeedRecords(animal)}
            />
          </Group>
        );
      },
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        border: "1px solid var(--mantine-color-gray-3)",
        borderRadius: 6,
        overflow: "auto",
        maxHeight: "100%",
      }}
    >
      <BaseTable
        columns={columns}
        data={animals}
        isLoading={isLoading}
        loadingText="Loading animals..."
        emptyState={{
          icon: IconDeer,
          title: "No Animals Found",
          description:
            "You haven't added any animals yet. Start by adding your first animal to track and manage your livestock.",
          iconColor: "var(--mantine-color-green-5)",
        }}
        stickyHeader={true}
        minWidth={720}
        tableLayout="fixed"
        verticalSpacing="sm"
        colgroup={[
          { width: "20%" },
          { width: "15%" },
          { width: "15%" },
          { width: "15%" },
          { width: "18%" },
          { width: "150px" },
        ]}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: onPageChange ?? (() => {}),
        }}
      />
    </div>
  );
}
