"use client";

import {
    Paper,
    Grid,
    Stack,
    Text,
    Title,
    Group,
    Loader,
    Center,
} from "@mantine/core";
import {
    IconDeer,
    IconWeight,
    IconShieldCheck,
    IconTrendingUp,
    IconBread,
} from "@tabler/icons-react";
import { useDashboard } from "../hooks/useDashboard";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    description?: string;
    iconColor?: string;
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
    description,
    iconColor,
}: StatCardProps) {
    return (
        <Paper 
            withBorder 
            p="md" 
            radius="md" 
            style={{ 
                height: "100%",
                backgroundColor: "var(--mantine-color-white)"
            }}
        >
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed" fw={500}>
                        {title}
                    </Text>
                    <Text size="xl" fw={700} c={color}>
                        {value}
                    </Text>
                    {description && (
                        <Text size="xs" c="dimmed">
                            {description}
                        </Text>
                    )}
                </Stack>
                <div style={{ opacity: 0.7 }}>
                    <Icon size={32} color={iconColor || color} />
                </div>
            </Group>
        </Paper>
    );
}

export default function LivestockDashboard() {
    const { stats, isLoading, error } = useDashboard();

    if (isLoading) {
        return (
            <Center h={400}>
                <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text c="dimmed">Loading dashboard data...</Text>
                </Stack>
            </Center>
        );
    }

    if (error) {
        return (
            <Paper withBorder p="xl" radius="md">
                <Text c="red" ta="center">
                    {error}
                </Text>
            </Paper>
        );
    }

    const formatWeight = (weight: number | null) => {
        if (weight === null) return "N/A";
        return `${weight.toFixed(1)} kg`;
    };

    const weightChartData = stats.weightTrends.map((trend) => ({
        month: new Date(trend.date + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        }),
        "Average Weight (kg)": parseFloat(trend.averageWeight.toFixed(1)),
    }));

    const feedChartData = stats.feedEntriesTrends.map((trend) => ({
        month: new Date(trend.date + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        }),
        "Total Feed (kg)": parseFloat(trend.totalQuantity.toFixed(1)),
        Entries: trend.count,
    }));

    return (
        <Stack gap="lg" style={{ backgroundColor: "transparent" }}>
            <Title order={3}>
                Herd Summary{" "}
                <Text component="span" size="sm" c="dimmed" fw={400}>
                    (Quick overview of your livestock performance)
                </Text>
            </Title>

            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Animals"
                        value={stats.totalAnimals}
                        icon={IconDeer}
                        color="blue"
                        description="Active livestock count"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Average Weight"
                        value={formatWeight(stats.averageWeight)}
                        icon={IconWeight}
                        color="green"
                        description="Based on latest records"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Vaccination Compliance"
                        value={`${stats.vaccinationCompliance}%`}
                        icon={IconShieldCheck}
                        color={
                            stats.vaccinationCompliance >= 80
                                ? "green"
                                : stats.vaccinationCompliance >= 50
                                  ? "yellow"
                                  : "red"
                        }
                        iconColor="red"
                        description="Animals with vaccination records"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Weight Records"
                        value={stats.totalWeightRecords}
                        icon={IconTrendingUp}
                        color="indigo"
                        description="Total measurements tracked"
                    />
                </Grid.Col>
            </Grid>

            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    {stats.weightTrends.length > 0 ? (
                        <Paper 
                            withBorder 
                            p="md" 
                            radius="md"
                            style={{ backgroundColor: "var(--mantine-color-white)" }}
                        >
                            <Stack gap="md">
                                <Title order={4}>
                                    Weight Trends{" "}
                                    <Text
                                        component="span"
                                        size="sm"
                                        c="dimmed"
                                        fw={400}
                                    >
                                        (Average weight over time (last 12
                                        months))
                                    </Text>
                                </Title>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={weightChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis
                                            label={{
                                                value: "Weight (kg)",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [
                                                `${value} kg`,
                                                "Average Weight",
                                            ]}
                                            labelFormatter={(label) =>
                                                `Month: ${label}`
                                            }
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="Average Weight (kg)"
                                            stroke="#228be6"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Stack>
                        </Paper>
                    ) : (
                        <Paper 
                            withBorder 
                            p="xl" 
                            radius="md"
                            style={{ backgroundColor: "var(--mantine-color-white)" }}
                        >
                            <Text c="dimmed" ta="center">
                                No weight data available yet. Start recording
                                weight measurements to see trends.
                            </Text>
                        </Paper>
                    )}
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    {stats.feedEntriesTrends.length > 0 ? (
                        <Paper 
                            withBorder 
                            p="md" 
                            radius="md"
                            style={{ backgroundColor: "var(--mantine-color-white)" }}
                        >
                            <Stack gap="md">
                                <Title order={4}>
                                    Feed Entries Progress{" "}
                                    <Text
                                        component="span"
                                        size="sm"
                                        c="dimmed"
                                        fw={400}
                                    >
                                        (Total feed quantity over time (last 12
                                        months))
                                    </Text>
                                </Title>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={feedChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            label={{
                                                value: "Feed Quantity (kg)",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            label={{
                                                value: "Entries",
                                                angle: 90,
                                                position: "insideRight",
                                            }}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            formatter={(
                                                value: number,
                                                name: string
                                            ) => {
                                                if (
                                                    name === "Total Feed (kg)"
                                                ) {
                                                    return [
                                                        `${value} kg`,
                                                        "Total Feed",
                                                    ];
                                                }
                                                return [value, "Entries"];
                                            }}
                                            labelFormatter={(label) =>
                                                `Month: ${label}`
                                            }
                                        />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="Total Feed (kg)"
                                            stroke="#51cf66"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="Entries"
                                            stroke="#bd7e12"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            strokeDasharray="5 5"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Stack>
                        </Paper>
                    ) : (
                        <Paper 
                            withBorder 
                            p="xl" 
                            radius="md"
                            style={{ backgroundColor: "var(--mantine-color-white)" }}
                        >
                            <Text c="dimmed" ta="center">
                                No feed entries data available yet. Start
                                recording feed entries to see progress.
                            </Text>
                        </Paper>
                    )}
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
