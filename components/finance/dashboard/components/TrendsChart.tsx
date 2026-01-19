"use client";

import { Paper, Text, Stack, Group, Select, Loader, Center, SimpleGrid } from "@mantine/core";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { DashboardTrendsResponse } from "../types";

interface TrendsChartProps {
    data: DashboardTrendsResponse | null;
    isLoading?: boolean;
    dateFrom: string;
    dateTo: string;
    groupBy?: "day" | "week" | "month" | "year";
    onGroupByChange?: (groupBy: "day" | "week" | "month" | "year") => void;
}

export default function TrendsChart({
    data,
    isLoading,
    dateFrom,
    dateTo,
    groupBy = "week",
    onGroupByChange,
}: TrendsChartProps) {
    const handleGroupByChange = (value: string | null) => {
        if (value && ["day", "week", "month", "year"].includes(value)) {
            const newGroupBy = value as "day" | "week" | "month" | "year";
            onGroupByChange?.(newGroupBy);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return (
            <Paper p="md" withBorder radius="md" style={{ marginBottom: 16 }}>
                <Group justify="space-between" align="center" mb="md">
                    <div>
                        <Text fw={600} size="md">
                            Financial Trends
                        </Text>
                        <Text c="dimmed" size="xs">
                            Revenue, expenses, and profit over time
                        </Text>
                    </div>
                </Group>
                <Center h={300}>
                    <Stack align="center" gap="md">
                        <Loader size="md" />
                        <Text c="dimmed" size="sm">
                            Loading trends data...
                        </Text>
                    </Stack>
                </Center>
            </Paper>
        );
    }

    if (!data || !data.trends || data.trends.length === 0) {
        return (
            <Paper p="md" withBorder radius="md" style={{ marginBottom: 16 }}>
                <Group justify="space-between" align="center" mb="md">
                    <div>
                        <Text fw={600} size="md">
                            Financial Trends
                        </Text>
                        <Text c="dimmed" size="xs">
                            Revenue, expenses, and profit over time
                        </Text>
                    </div>
                </Group>
                <Center h={300}>
                    <Text c="dimmed" size="sm">
                        No trends data available for the selected period
                    </Text>
                </Center>
            </Paper>
        );
    }

    const chartData = data.trends.map((item) => ({
        period: item.label,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit,
    }));

    return (
        <Paper p="md" withBorder radius="md" style={{ marginBottom: 16 }}>
            <Group justify="space-between" align="center" mb="md">
                <div>
                    <Text fw={600} size="md">
                        Financial Trends
                    </Text>
                    <Text c="dimmed" size="xs">
                        Revenue, expenses, and profit over time
                    </Text>
                </div>
                <Select
                    value={groupBy}
                    onChange={handleGroupByChange}
                    data={[
                        { value: "day", label: "Daily" },
                        { value: "week", label: "Weekly" },
                        { value: "month", label: "Monthly" },
                        { value: "year", label: "Yearly" },
                    ]}
                    size="xs"
                    style={{ width: 120 }}
                />
            </Group>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                {/* Revenue Chart */}
                <Paper p="sm" withBorder radius="md" style={{ backgroundColor: "#f0fdf4" }}>
                    <Text fw={600} size="sm" mb="xs" c="green">
                        Revenue
                    </Text>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                width={60}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Expenses Chart */}
                <Paper p="sm" withBorder radius="md" style={{ backgroundColor: "#fef2f2" }}>
                    <Text fw={600} size="sm" mb="xs" c="red">
                        Expenses
                    </Text>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                width={60}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#colorExpenses)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Profit Chart */}
                <Paper p="sm" withBorder radius="md" style={{ backgroundColor: "#eff6ff" }}>
                    <Text fw={600} size="sm" mb="xs" c="blue">
                        Profit
                    </Text>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                width={60}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Bar
                                dataKey="profit"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </SimpleGrid>
        </Paper>
    );
}

