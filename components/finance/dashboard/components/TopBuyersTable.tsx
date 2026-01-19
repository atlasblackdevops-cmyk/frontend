"use client";

import { Paper, Text, Table, Loader, Center, Stack } from "@mantine/core";
import type { TopBuyer } from "../types";

interface TopBuyersTableProps {
    data: TopBuyer[];
    isLoading?: boolean;
}

export default function TopBuyersTable({
    data,
    isLoading,
}: TopBuyersTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    if (isLoading) {
        return (
            <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
                <Text fw={600} size="md" mb="md">
                    Top Buyers
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

    if (!data || data.length === 0) {
        return (
            <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
                <Text fw={600} size="md" mb="md">
                    Top Buyers
                </Text>
                <Center h={200}>
                    <Text c="dimmed" size="sm">
                        No buyer data available
                    </Text>
                </Center>
            </Paper>
        );
    }

    return (
        <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
            <Text fw={600} size="md" mb="md">
                Top Buyers
            </Text>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Buyer</Table.Th>
                        <Table.Th style={{ textAlign: "right" }}>Total Amount</Table.Th>
                        <Table.Th style={{ textAlign: "right" }}>Transactions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((buyer, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>
                                <Text size="sm" fw={500}>
                                    {buyer.buyerName || "N/A"}
                                </Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "right" }}>
                                <Text size="sm" c="green" fw={600}>
                                    {formatCurrency(buyer.totalAmount)}
                                </Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "right" }}>
                                <Text size="sm" c="dimmed">
                                    {buyer.transactionCount}
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}

