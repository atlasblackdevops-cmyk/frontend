"use client";

import { Avatar, Badge, Group, Text } from "@mantine/core";
import { IconTools } from "@tabler/icons-react";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { EquipmentRecord, EquipmentTableProps } from "../types";
import EquipmentActionsMenu from "./EquipmentActionsMenu";

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: string | null | undefined): string {
  if (!amount) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount));
  } catch {
    return amount;
  }
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "operational":
      return "green";
    case "under_maintenance":
      return "yellow";
    case "broken":
      return "red";
    case "retired":
      return "gray";
    default:
      return "blue";
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "operational":
      return "Operational";
    case "under_maintenance":
      return "Under Maintenance";
    case "broken":
      return "Broken";
    case "retired":
      return "Retired";
    default:
      return status;
  }
}

export default function EquipmentTable({
  equipment,
  pagination,
  isLoading,
  canUpdate,
  canDelete,
  onUpdate,
  onDelete,
  onOpenMaintenance,
  onPageChange,
}: EquipmentTableProps) {
  const columns: BaseTableColumn<EquipmentRecord>[] = [
    {
      key: "equipment",
      label: "Equipment",
      render: (item) => (
        <Group gap="sm">
          <Avatar src={item.photo} radius="md" size={32}>
            {!item.photo && item.equipmentName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text fw={600}>{item.equipmentName}</Text>
            {item.brand && item.model && (
              <Text size="xs" c="dimmed">
                {item.brand} {item.model}
              </Text>
            )}
          </div>
        </Group>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item) => (
        <Text size="sm">{item.equipmentType || "-"}</Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge variant="light" color={getStatusColor(item.status)}>
          {getStatusLabel(item.status)}
        </Badge>
      ),
    },
    {
      key: "purchaseDate",
      label: "Purchase Date",
      render: (item) => <Text size="sm">{formatDate(item.purchaseDate)}</Text>,
    },
    {
      key: "purchaseCost",
      label: "Purchase Cost",
      render: (item) => <Text size="sm">{formatCurrency(item.purchaseCost)}</Text>,
    },
    {
      key: "actions",
      label: "Actions",
      width: "150px",
      render: (item) => (
        <TableActionButtons
          canUpdate={canUpdate}
          canDelete={canDelete}
          onUpdate={() => onUpdate(item)}
          onDelete={() => onDelete(item)}
          updateLabel="Edit equipment"
          deleteLabel="Delete equipment"
          justify="flex-start"
          customActions={
            <EquipmentActionsMenu
              equipment={item}
              onOpenMaintenance={() => onOpenMaintenance(item)}
            />
          }
        />
      ),
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={equipment}
      isLoading={isLoading}
      loadingText="Loading equipment..."
      emptyState={{
        icon: IconTools,
        title: "No Equipment Found",
        description:
          "You haven't added any equipment yet. Start by adding your first equipment to track and manage your farm machinery.",
        iconColor: "var(--mantine-color-blue-5)",
      }}
      stickyHeader={true}
      minWidth={800}
      tableLayout="fixed"
      verticalSpacing="sm"
      colgroup={[
        { width: "25%" },
        { width: "15%" },
        { width: "15%" },
        { width: "15%" },
        { width: "15%" },
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

