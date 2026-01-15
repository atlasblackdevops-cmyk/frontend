"use client";

import { Text, Badge } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import BaseTable, { BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { RevenueTableProps, RevenueRecord } from "../types";

export default function RevenueTable({
    revenues,
    pagination,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onPageChange,
}: RevenueTableProps) {
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

    const formatCurrency = (amount: number, currency: string) => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency || "USD",
            }).format(amount);
        } catch {
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const columns: BaseTableColumn<RevenueRecord>[] = [
        {
            key: "revenueDate",
            label: "Date",
            width: "12%",
            render: (revenue) => (
                <Text size="sm" lineClamp={1}>
                    {formatDate(revenue.revenueDate)}
                </Text>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            width: "15%",
            render: (revenue) => (
                <Text fw={600} size="sm" c="green" lineClamp={1}>
                    {formatCurrency(revenue.amount, revenue.currencyType)}
                </Text>
            ),
        },
        {
            key: "buyerName",
            label: "Buyer",
            width: "15%",
            render: (revenue) => (
                <Text size="sm" c="dimmed" lineClamp={1} title={revenue.buyerName || "N/A"}>
                    {revenue.buyerName || "N/A"}
                </Text>
            ),
        },
        {
            key: "productSold",
            label: "Product",
            width: "15%",
            render: (revenue) => (
                <Text size="sm" lineClamp={1} title={revenue.productSold || "N/A"}>
                    {revenue.productSold || "N/A"}
                </Text>
            ),
        },
        {
            key: "quantity",
            label: "Quantity",
            width: "12%",
            render: (revenue) => (
                revenue.quantity ? (
                    <Text size="sm" lineClamp={1} title={`${revenue.quantity} ${revenue.quantityUnit || ""}`}>
                        {revenue.quantity} {revenue.quantityUnit || ""}
                    </Text>
                ) : (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                        N/A
                    </Text>
                )
            ),
        },
        {
            key: "paymentMethod",
            label: "Payment Method",
            width: "12%",
            render: (revenue) => (
                revenue.paymentMethod ? (
                    <Badge variant="light" color="gray" size="sm">
                        {revenue.paymentMethod}
                    </Badge>
                ) : (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                        N/A
                    </Text>
                )
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "100px",
            render: (revenue) => (
                <TableActionButtons
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={() => onUpdate(revenue)}
                    onDelete={() => onDelete(revenue)}
                    updateLabel="Edit revenue"
                    deleteLabel="Delete revenue"
                />
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={revenues}
            isLoading={isLoading}
            emptyState={{
                icon: IconChartBar,
                title: "No Revenues Found",
                description: "You haven't added any revenue records yet. Start by adding your first revenue to track farm income.",
                iconColor: "var(--mantine-color-green-5)",
            }}
            stickyHeader={true}
            minWidth={900}
            tableLayout="fixed"
            verticalSpacing="sm"
            colgroup={[
                { width: "12%" },
                { width: "15%" },
                { width: "15%" },
                { width: "15%" },
                { width: "12%" },
                { width: "12%" },
                { width: "19%" },
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

