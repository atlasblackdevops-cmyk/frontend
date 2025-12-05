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
    IconUsersGroup,
    IconDeer,
    IconWeight,
    IconCalendar,
    IconTrendingUp,
} from "@tabler/icons-react";
import type { GroupMetrics } from "../types";

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
        <Paper withBorder p="md" radius="md" style={{ height: "100%" }}>
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

interface GroupDashboardProps {
    metrics: GroupMetrics;
    isLoading: boolean;
    error: string | null;
}

export default function GroupDashboard({
    metrics,
    isLoading,
    error,
}: GroupDashboardProps) {
    if (isLoading) {
        return (
            <Center h={400}>
                <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text c="dimmed">Loading group metrics...</Text>
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

    const formatAge = (age: number | null) => {
        if (age === null) return "N/A";
        const years = Math.floor(age / 12);
        const months = Math.floor(age % 12);
        if (years > 0 && months > 0) {
            return `${years}y ${months}m`;
        } else if (years > 0) {
            return `${years} years`;
        } else {
            return `${months} months`;
        }
    };

    return (
        <Stack gap="lg">
            <Title order={3}>
                Group Overview{" "}
                <Text component="span" size="sm" c="dimmed" fw={400}>
                    (Average metrics across all animal groups)
                </Text>
            </Title>

            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Groups"
                        value={metrics.totalGroups}
                        icon={IconUsersGroup}
                        color="blue"
                        description="Active animal groups"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Animals in Groups"
                        value={metrics.animalsInGroups}
                        icon={IconDeer}
                        color="green"
                        description="Total animals assigned"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Average Group Size"
                        value={
                            metrics.averageGroupSize !== null &&
                            metrics.averageGroupSize !== undefined
                                ? metrics.averageGroupSize.toFixed(1)
                                : "0.0"
                        }
                        icon={IconTrendingUp}
                        color="indigo"
                        description="Animals per group"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Average Weight"
                        value={formatWeight(metrics.averageWeight)}
                        icon={IconWeight}
                        color="orange"
                        description="Across all groups"
                    />
                </Grid.Col>
            </Grid>

            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper withBorder p="md" radius="md">
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Title order={4}>Average Age</Title>
                                <IconCalendar size={24} color="gray" />
                            </Group>
                            <Text size="xl" fw={700} c="teal">
                                {formatAge(metrics.averageAge)}
                            </Text>
                            <Text size="sm" c="dimmed">
                                Average age of animals across all groups
                            </Text>
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper withBorder p="md" radius="md">
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Title order={4}>Group Distribution</Title>
                                <IconUsersGroup size={24} color="gray" />
                            </Group>
                            <Text size="xl" fw={700} c="blue">
                                {metrics.totalGroups} groups
                            </Text>
                            <Text size="sm" c="dimmed">
                                Managing {metrics.animalsInGroups} animals
                                {metrics.averageGroupSize !== null &&
                                metrics.averageGroupSize !== undefined
                                    ? ` with an average of ${metrics.averageGroupSize.toFixed(1)} animals per group`
                                    : ""}
                            </Text>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
