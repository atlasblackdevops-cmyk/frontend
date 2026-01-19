"use client";

import { Paper, Text, Stack, Center, Loader } from "@mantine/core";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ExpenseCategory } from "../types";

interface ExpenseCategoriesChartProps {
    data: ExpenseCategory[];
    isLoading?: boolean;
}

const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#14b8a6",
];

export default function ExpenseCategoriesChart({
    data,
    isLoading,
}: ExpenseCategoriesChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    };

    if (isLoading) {
        return (
            <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
                <Text fw={600} size="md" mb="md">
                    Expense Categories
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

    if (!data || data.length === 0) {
        return (
            <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
                <Text fw={600} size="md" mb="md">
                    Expense Categories
                </Text>
                <Center h={250}>
                    <Text c="dimmed" size="sm">
                        No expense category data available
                    </Text>
                </Center>
            </Paper>
        );
    }

    const chartData = data.map((item) => ({
        name: item.categoryName,
        value: item.totalAmount,
        percentage: item.percentage,
    }));

    return (
        <Paper p="md" withBorder radius="md" style={{ height: "100%" }}>
            <Text fw={600} size="md" mb="md">
                Expense Categories
            </Text>
            <div style={{ width: "100%", height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            isAnimationActive={false}
                            key={chartData.length}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${entry.name}-${index}`}
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
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: "10px" }}
                            iconSize={12}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Paper>
    );
}

