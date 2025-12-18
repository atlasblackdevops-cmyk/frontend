"use client";

import { Avatar, Badge, Group, Text } from "@mantine/core";
import { IconDeer } from "@tabler/icons-react";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
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
        variant="light"
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
      render: (animal) => (
        <TableActionButtons
          canUpdate={canUpdate}
          canDelete={canDelete}
          onUpdate={() => onUpdate(animal)}
          onDelete={() => onDelete(animal)}
          updateLabel="Edit animal"
          deleteLabel="Delete animal"
          justify="flex-start"
          customActions={
            <AnimalActionsMenu
              animal={animal}
              onOpenHealthRecords={() => onOpenHealthRecords(animal)}
              onOpenWeightRecords={() => onOpenWeightRecords(animal)}
              onOpenFeedRecords={() => onOpenFeedRecords(animal)}
            />
          }
        />
      ),
    },
  ];

  return (
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
          { width: "25%" },
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
  );
}
