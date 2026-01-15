"use client";

import { Text, Badge } from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons-react";
import BaseTable, { BaseTableColumn } from "@/components/ui/BaseTable";
import { TableActionButtons } from "@/components/ui";
import type { ExpenseTableProps, ExpenseRecord } from "../types";

export default function ExpenseTable({
    expenses,
    pagination,
    isLoading,
    canUpdate,
    canDelete,
    onUpdate,
    onDelete,
    onPageChange,
}: ExpenseTableProps) {
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

    const columns: BaseTableColumn<ExpenseRecord>[] = [
        {
            key: "categoryName",
            label: "Category",
            width: "15%",
            render: (expense) => (
                <Text fw={500} size="sm" lineClamp={1} title={expense.categoryName || "N/A"}>
                    {expense.categoryName || "N/A"}
                </Text>
            ),
        },
        {
            key: "expenseDate",
            label: "Date",
            width: "12%",
            render: (expense) => (
                <Text size="sm" lineClamp={1}>
                    {formatDate(expense.expenseDate)}
                </Text>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            width: "15%",
            render: (expense) => (
                <Text fw={600} size="sm" c="red" lineClamp={1}>
                    {formatCurrency(expense.amount, expense.currencyType)}
                </Text>
            ),
        },
        {
            key: "vendor",
            label: "Vendor",
            width: "15%",
            render: (expense) => (
                <Text size="sm" c="dimmed" lineClamp={1} title={expense.vendor || "N/A"}>
                    {expense.vendor || "N/A"}
                </Text>
            ),
        },
        {
            key: "description",
            label: "Description",
            width: "20%",
            render: (expense) => (
                <Text size="sm" lineClamp={1} title={expense.description || "N/A"}>
                    {expense.description || "N/A"}
                </Text>
            ),
        },
        {
            key: "paymentMethod",
            label: "Payment Method",
            width: "12%",
            render: (expense) => (
                expense.paymentMethod ? (
                    <Badge variant="light" color="gray" size="sm">
                        {expense.paymentMethod}
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
            render: (expense) => (
                <TableActionButtons
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onUpdate={() => onUpdate(expense)}
                    onDelete={() => onDelete(expense)}
                    updateLabel="Edit expense"
                    deleteLabel="Delete expense"
                />
            ),
        },
    ];

    return (
        <BaseTable
            columns={columns}
            data={expenses}
            isLoading={isLoading}
            emptyState={{
                icon: IconCurrencyDollar,
                title: "No Expenses Found",
                description: "You haven't added any expenses yet. Start by adding your first expense to track farm expenditures.",
                iconColor: "var(--mantine-color-red-5)",
            }}
            stickyHeader={true}
            minWidth={900}
            tableLayout="fixed"
            verticalSpacing="sm"
            colgroup={[
                { width: "15%" },
                { width: "12%" },
                { width: "15%" },
                { width: "15%" },
                { width: "20%" },
                { width: "12%" },
                { width: "11%" },
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

