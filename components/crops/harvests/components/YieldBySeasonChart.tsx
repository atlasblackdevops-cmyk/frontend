"use client";

import { Paper, Text, Stack, Group, Loader, Center, Collapse, ActionIcon } from "@mantine/core";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import type { YieldBySeasonChartProps } from "../types";

export default function YieldBySeasonChart({
    data,
    isLoading = false,
}: YieldBySeasonChartProps) {
    const [opened, setOpened] = useState(true);

    if (isLoading) {
        return (
            <Paper p="md" withBorder radius="md" style={{ marginBottom: 16 }}>
                <Group justify="space-between" align="center" mb="md">
                    <div>
                        <Text fw={600} size="md">
                            Yield by Season
                        </Text>
                        <Text c="dimmed" size="xs">
                            Track yield performance across seasons
                        </Text>
                    </div>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => setOpened(!opened)}
                        size="sm"
                    >
                        {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                </Group>
                <Collapse in={opened}>
                    <Center h={200}>
                        <Stack align="center" gap="md">
                            <Loader size="md" />
                            <Text c="dimmed" size="sm">Loading yield data...</Text>
                        </Stack>
                    </Center>
                </Collapse>
            </Paper>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper p="md" withBorder radius="md" style={{ marginBottom: 16 }}>
                <Group justify="space-between" align="center" mb="md">
                    <div>
                        <Text fw={600} size="md">
                            Yield by Season
                        </Text>
                        <Text c="dimmed" size="xs">
                            Track yield performance across seasons
                        </Text>
                    </div>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => setOpened(!opened)}
                        size="sm"
                    >
                        {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                </Group>
                <Collapse in={opened}>
                    <Center h={200}>
                        <Text c="dimmed" size="sm">
                            No yield data available for the selected period
                        </Text>
                    </Center>
                </Collapse>
            </Paper>
        );
    }

    // Group data by season and crop type
    const groupedData: Record<string, Record<string, number>> = {};
    const seasons = new Set<string>();
    const cropTypes = new Set<string>();

    data.forEach((item) => {
        seasons.add(item.season);
        cropTypes.add(item.cropType);
        if (!groupedData[item.season]) {
            groupedData[item.season] = {};
        }
        groupedData[item.season][item.cropType] = item.yieldAmount;
    });

    // Convert to chart format
    const chartData = Array.from(seasons)
        .sort()
        .map((season) => {
            const entry: Record<string, string | number> = { season };
            cropTypes.forEach((cropType) => {
                entry[cropType] = groupedData[season]?.[cropType] || 0;
            });
            return entry;
        });

    // Generate colors for different crop types
    const colors = [
        "#22c55e", // green
        "#3b82f6", // blue
        "#f59e0b", // amber
        "#ef4444", // red
        "#8b5cf6", // purple
        "#ec4899", // pink
        "#06b6d4", // cyan
        "#f97316", // orange
    ];

    const cropTypeArray = Array.from(cropTypes);

    return (
        <Paper p="md" withBorder radius="md" style={{ marginBottom: 16 }}>
            <Group justify="space-between" align="center" mb="md">
                <div>
                    <Text fw={600} size="md">
                        Yield by Season
                    </Text>
                    <Text c="dimmed" size="xs">
                        Track yield performance across seasons
                    </Text>
                </div>
                <ActionIcon
                    variant="subtle"
                    onClick={() => setOpened(!opened)}
                    size="sm"
                >
                    {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </ActionIcon>
            </Group>

            <Collapse in={opened}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="season"
                            angle={-35}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 11 }}
                            interval={0}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            width={50}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: "10px" }}
                            iconSize={12}
                            iconType="line"
                        />
                        {cropTypeArray.map((cropType, index) => (
                            <Line
                                key={cropType}
                                type="monotone"
                                dataKey={cropType}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </Collapse>
        </Paper>
    );
}

