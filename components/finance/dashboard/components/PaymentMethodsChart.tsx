"use client";

import { Paper, Text, SimpleGrid, Loader, Center, Stack } from "@mantine/core";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { PaymentMethods } from "../types";

interface PaymentMethodsChartProps {
    data: PaymentMethods | null;
    isLoading?: boolean;
}

const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
];

export default function PaymentMethodsChart({
    data,
    isLoading,
}: PaymentMethodsChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    };

    if (isLoading || !data) {
        return (
            <Paper p="md" withBorder radius="md">
                <Text fw={600} size="md" mb="md">
                    Payment Methods
                </Text>
                <Center h={250}>
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

    const expenseData = data.expenses.map((item) => ({
        name: item.method,
        value: item.totalAmount,
        count: item.count,
    }));

    const revenueData = data.revenues.map((item) => ({
        name: item.method,
        value: item.totalAmount,
        count: item.count,
    }));

    return (
        <Paper p="md" withBorder radius="md">
            <Text fw={600} size="md" mb="md">
                Payment Methods
            </Text>
            <SimpleGrid cols={2} spacing="md">
                <div>
                    <Text size="sm" fw={500} mb="xs" c="red">
                        Expenses
                    </Text>
                    {expenseData.length > 0 ? (
                        <div style={{ width: "100%", height: 250, minHeight: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        cx="50%"
                                        cy="45%"
                                        labelLine={false}
                                        label={false}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        isAnimationActive={false}
                                        key={`expense-${expenseData.length}`}
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell
                                                key={`cell-expense-${entry.name}-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e0e0e0",
                                            borderRadius: "6px",
                                        }}
                                        labelFormatter={(name) => name}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry) => {
                                            const amount = entry.payload?.value ?? 0;
                                            return `${value}: ${formatCurrency(amount)}`;
                                        }}
                                        iconSize={10}
                                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <Center h={200}>
                            <Text c="dimmed" size="sm">
                                No expense payment data
                            </Text>
                        </Center>
                    )}
                </div>
                <div>
                    <Text size="sm" fw={500} mb="xs" c="green">
                        Revenues
                    </Text>
                    {revenueData.length > 0 ? (
                        <div style={{ width: "100%", height: 250, minHeight: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="45%"
                                        labelLine={false}
                                        label={false}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        isAnimationActive={false}
                                        key={`revenue-${revenueData.length}`}
                                    >
                                        {revenueData.map((entry, index) => (
                                            <Cell
                                                key={`cell-revenue-${entry.name}-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e0e0e0",
                                            borderRadius: "6px",
                                        }}
                                        labelFormatter={(name) => name}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry) => {
                                            const amount = entry.payload?.value ?? 0;
                                            return `${value}: ${formatCurrency(amount)}`;
                                        }}
                                        iconSize={10}
                                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <Center h={200}>
                            <Text c="dimmed" size="sm">
                                No revenue payment data
                            </Text>
                        </Center>
                    )}
                </div>
            </SimpleGrid>
        </Paper>
    );
}

