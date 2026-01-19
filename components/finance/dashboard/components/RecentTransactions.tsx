"use client";

import { Paper, Text, Table, Loader, Center, Stack, Tabs } from "@mantine/core";
import type { RecentTransactions as RecentTransactionsType } from "../types";

interface RecentTransactionsProps {
    data: RecentTransactionsType | null;
    isLoading?: boolean;
}

export default function RecentTransactions({
    data,
    isLoading,
}: RecentTransactionsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getCategoryName = (expense: { category: { categoryName: string } | null; otherCategoryName: string | null }) => {
        // If category is null, show otherCategoryName if available
        if (!expense.category && expense.otherCategoryName) {
            return expense.otherCategoryName;
        }
        
        // If category name is "Other", show otherCategoryName if available
        const categoryName = expense.category?.categoryName?.toLowerCase();
        if (categoryName === "other" && expense.otherCategoryName) {
            return expense.otherCategoryName;
        }
        
        // Otherwise show the regular category name or N/A
        return expense.category?.categoryName || "N/A";
    };

    if (isLoading) {
        return (
            <Paper p="md" withBorder radius="md">
                <Text fw={600} size="md" mb="md">
                    Recent Transactions
                </Text>
                <Center h={200}>
                    <Stack align="center" gap="md">
                        <Loader size="md" />
                        <Text c="dimmed" size="sm">
                            Loading...
                        </Text>
                    </Stack>
                </Center>
            </Paper>
        );
    }

    if (!data || (!data.expenses.length && !data.revenues.length)) {
        return (
            <Paper p="md" withBorder radius="md">
                <Text fw={600} size="md" mb="md">
                    Recent Transactions
                </Text>
                <Center h={200}>
                    <Text c="dimmed" size="sm">
                        No recent transactions available
                    </Text>
                </Center>
            </Paper>
        );
    }

    return (
        <Paper p="md" withBorder radius="md">
            <Text fw={600} size="md" mb="md">
                Recent Transactions
            </Text>
            <Tabs defaultValue="expenses">
                <Tabs.List>
                    <Tabs.Tab value="expenses">Recent Expenses</Tabs.Tab>
                    <Tabs.Tab value="revenues">Recent Revenues</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="expenses" pt="md">
                    {data.expenses.length > 0 ? (
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Vendor</Table.Th>
                                    <Table.Th>Category</Table.Th>
                                    <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.expenses.map((expense) => (
                                    <Table.Tr key={expense.id}>
                                        <Table.Td>
                                            <Text size="sm">
                                                {formatDate(expense.expenseDate)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {expense.vendor || "N/A"}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">
                                                {getCategoryName(expense)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: "right" }}>
                                            <Text size="sm" c="red" fw={600}>
                                                {formatCurrency(expense.amount)}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Center h={150}>
                            <Text c="dimmed" size="sm">
                                No recent expenses
                            </Text>
                        </Center>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="revenues" pt="md">
                    {data.revenues.length > 0 ? (
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Buyer</Table.Th>
                                    <Table.Th>Product</Table.Th>
                                    <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.revenues.map((revenue) => (
                                    <Table.Tr key={revenue.id}>
                                        <Table.Td>
                                            <Text size="sm">
                                                {formatDate(revenue.revenueDate)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {revenue.buyerName || "N/A"}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">
                                                {revenue.productSold || "N/A"}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: "right" }}>
                                            <Text size="sm" c="green" fw={600}>
                                                {formatCurrency(revenue.amount)}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Center h={150}>
                            <Text c="dimmed" size="sm">
                                No recent revenues
                            </Text>
                        </Center>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Paper>
    );
}

