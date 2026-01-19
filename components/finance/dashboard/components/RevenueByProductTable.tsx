"use client";

import { Paper, Text, Table, Loader, Center, Stack } from "@mantine/core";
import type { RevenueByProduct } from "../types";

interface RevenueByProductTableProps {
    data: RevenueByProduct[];
    isLoading?: boolean;
}

export default function RevenueByProductTable({
    data,
    isLoading,
}: RevenueByProductTableProps) {
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
                    Revenue by Product
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
                    Revenue by Product
                </Text>
                <Center h={200}>
                    <Text c="dimmed" size="sm">
                        No product revenue data available
                    </Text>
                </Center>
            </Paper>
        );
    }

    return (
        <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
            <Text fw={600} size="md" mb="md">
                Revenue by Product
            </Text>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Product</Table.Th>
                        <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
                        <Table.Th style={{ textAlign: "right" }}>Total Revenue</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((product, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>
                                <Text size="sm" fw={500}>
                                    {product.productSold || "N/A"}
                                </Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "right" }}>
                                <Text size="sm" c="dimmed">
                                    {product.totalQuantity} {product.unit || ""}
                                </Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "right" }}>
                                <Text size="sm" c="green" fw={600}>
                                    {formatCurrency(product.totalAmount)}
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}

