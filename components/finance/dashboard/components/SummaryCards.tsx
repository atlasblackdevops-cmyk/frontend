"use client";

import { Paper, Group, Stack, Text } from "@mantine/core";
import { IconTrendingUp, IconTrendingDown, IconCurrencyDollar, IconPercentage } from "@tabler/icons-react";
import type { DashboardSummaryResponse } from "../types";

interface SummaryCardsProps {
    data: DashboardSummaryResponse | null;
    isLoading?: boolean;
}

function SummaryCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
}) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatValue = typeof value === "number" ? formatCurrency(value) : value;

    return (
        <Paper
            withBorder
            p="md"
            radius="md"
            style={{
                height: "100%",
                backgroundColor: "var(--mantine-color-white)",
            }}
        >
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed" fw={500}>
                        {title}
                    </Text>
                    <Text size="xl" fw={700} c={color}>
                        {formatValue}
                    </Text>
                </Stack>
                <div style={{ opacity: 0.7 }}>
                    <Icon size={32} color={color} />
                </div>
            </Group>
        </Paper>
    );
}

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
    if (isLoading || !data) {
        return null;
    }

    const { summary } = data;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <SummaryCard
                title="Total Revenue"
                value={summary.totalRevenue}
                icon={IconTrendingUp}
                color="#22c55e"
            />
            <SummaryCard
                title="Total Expenses"
                value={summary.totalExpenses}
                icon={IconTrendingDown}
                color="#ef4444"
            />
            <SummaryCard
                title="Net Profit"
                value={summary.netProfit}
                icon={IconCurrencyDollar}
                color="#3b82f6"
            />
            <SummaryCard
                title="Profit Margin"
                value={`${summary.profitMargin.toFixed(2)}%`}
                icon={IconPercentage}
                color="#8b5cf6"
            />
        </div>
    );
}

