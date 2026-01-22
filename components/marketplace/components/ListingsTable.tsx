"use client";

import { Avatar, Badge, Group, Text } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import BaseTable, { type BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { ListingRecord, ListingsTableProps } from "../types";

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
    case "active":
      return "green";
    case "inactive":
      return "gray";
    case "sold":
      return "red";
    case "pending":
      return "yellow";
    default:
      return "blue";
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "sold":
      return "Sold";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

function getCategoryLabel(category: string): string {
  switch (category?.toLowerCase()) {
    case "produce":
      return "Produce";
    case "livestock":
      return "Livestock";
    case "equipment":
      return "Equipment";
    case "seeds":
      return "Seeds";
    case "fertilizer":
      return "Fertilizer";
    case "other":
      return "Other";
    default:
      return category;
  }
}

export default function ListingsTable({
  listings,
  pagination,
  isLoading,
  canUpdate,
  canDelete,
  onUpdate,
  onDelete,
  onPageChange,
}: ListingsTableProps) {
  const columns: BaseTableColumn<ListingRecord>[] = [
    {
      key: "listing",
      label: "Listing",
      render: (item) => {
        const firstImage = item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
        return (
          <Group gap="sm" align="center">
            <Avatar src={firstImage} radius="md" size={40}>
              {!firstImage && <IconShoppingCart size={20} />}
            </Avatar>
            <Text fw={600} size="sm">{item.title}</Text>
          </Group>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (item) => (
        <Badge variant="light" color="blue">
          {getCategoryLabel(item.category)}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (item) => (
        <Text size="sm" fw={500}>
          {formatCurrency(item.price)}
        </Text>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (item) => (
        <Text size="sm">
          {item.quantityAvailable} {item.quantityUnit || "units"}
        </Text>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge color={getStatusColor(item.status)} variant="light">
          {getStatusLabel(item.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <TableActionButtons
          canUpdate={canUpdate}
          canDelete={canDelete}
          onUpdate={() => onUpdate(item)}
          onDelete={() => onDelete(item)}
        />
      ),
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={listings}
      isLoading={isLoading}
      emptyState={{
        icon: IconShoppingCart,
        title: "No Listings Found",
        description: "Start by creating your first marketplace listing.",
        iconColor: "var(--mantine-color-gray-5)",
      }}
      stickyHeader={true}
      minWidth={700}
      tableLayout="fixed"
      verticalSpacing="sm"
      pagination={
        pagination.totalPages > 0
          ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: onPageChange || (() => {}),
            }
          : undefined
      }
    />
  );
}

