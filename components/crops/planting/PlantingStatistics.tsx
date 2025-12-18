"use client";

import { useEffect, useState } from "react";
import {
    Paper,
    Grid,
    Card,
    Text,
    Title,
    Group,
    Stack,
    Badge,
    Loader,
    Alert,
    Progress,
    Box,
    Divider,
    ScrollArea,
    TextInput,
} from "@mantine/core";
import {
    IconSeeding,
    IconMapPin,
    IconChartBar,
    IconCalendar,
    IconAlertCircle,
    IconTractor,
    IconPlant2,
    IconMap2,
    IconSearch,
} from "@tabler/icons-react";
import { usePlantingStatistics } from "../hooks";
import type { CropBreakdown, UpcomingHarvest } from "../types";

interface PlantingStatisticsProps {
    refetchTrigger?: number;
}

export default function PlantingStatistics({ refetchTrigger }: PlantingStatisticsProps = {}) {
    const { statistics, isLoading, error, refetch } = usePlantingStatistics();
    const [fieldSearch, setFieldSearch] = useState("");

    // Refetch when trigger changes (but not on initial mount)
    useEffect(() => {
        if (refetchTrigger !== undefined && refetchTrigger > 0) {
            refetch();
        }
    }, [refetchTrigger]);

    if (isLoading) {
        return (
            <Paper p="xl" withBorder>
                <Group justify="center" p="xl">
                    <Loader size="lg" />
                    <Text>Loading planting statistics...</Text>
                </Group>
            </Paper>
        );
    }

    if (error) {
        return (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
                {error}
            </Alert>
        );
    }

    if (!statistics) {
        return null;
    }

    const { summary, cropBreakdown, upcomingHarvests, fieldsWithNoActivePlantings } = statistics;

    // Calculate field utilization percentage
    const fieldUtilization = summary.totalFields > 0
        ? Math.round((summary.totalFieldsWithPlantings / summary.totalFields) * 100)
        : 0;

    // Filter fields based on search
    const filteredFields = fieldsWithNoActivePlantings.filter((field) =>
        field.fieldName.toLowerCase().includes(fieldSearch.toLowerCase())
    );

    return (
        <Stack gap="lg">
            {/* Summary Cards */}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed" fw={500}>
                                Active Plantings
                            </Text>
                            <IconSeeding size={24} stroke={1.5} color="var(--mantine-color-green-6)" />
                        </Group>
                        <Title order={2} c="green">
                            {summary.totalActivePlantings}
                        </Title>
                        <Text size="xs" c="dimmed" mt="xs">
                            Across {summary.totalFieldsWithPlantings} fields
                        </Text>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed" fw={500}>
                                Total Area Planted
                            </Text>
                            <IconMap2 size={24} stroke={1.5} color="var(--mantine-color-blue-6)" />
                        </Group>
                        <Title order={2} c="blue">
                            {summary.totalAreaPlanted.toFixed(1)}
                        </Title>
                        <Text size="xs" c="dimmed" mt="xs">
                            Acres under cultivation
                        </Text>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed" fw={500}>
                                Unique Crops
                            </Text>
                            <IconPlant2 size={24} stroke={1.5} color="var(--mantine-color-teal-6)" />
                        </Group>
                        <Title order={2} c="teal">
                            {summary.uniqueCrops}
                        </Title>
                        <Text size="xs" c="dimmed" mt="xs">
                            Different crop varieties
                        </Text>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed" fw={500}>
                                Upcoming Harvests
                            </Text>
                            <IconCalendar size={24} stroke={1.5} color="var(--mantine-color-orange-6)" />
                        </Group>
                        <Title order={2} c="orange">
                            {summary.upcomingHarvestsCount}
                        </Title>
                        <Text size="xs" c="dimmed" mt="xs">
                            Ready soon
                        </Text>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Field Utilization */}
            <Paper p="md" withBorder>
                <Group justify="space-between" mb="md">
                    <div>
                        <Text size="sm" fw={600}>
                            Field Utilization
                        </Text>
                        <Text size="xs" c="dimmed">
                            {summary.totalFieldsWithPlantings} of {summary.totalFields} fields in use
                        </Text>
                    </div>
                    <Badge size="lg" variant="light" color={fieldUtilization >= 80 ? "green" : fieldUtilization >= 50 ? "yellow" : "red"}>
                        {fieldUtilization}%
                    </Badge>
                </Group>
                <Progress
                    value={fieldUtilization}
                    color={fieldUtilization >= 80 ? "green" : fieldUtilization >= 50 ? "yellow" : "red"}
                    size="lg"
                    radius="md"
                />
                {summary.totalFieldsWithoutPlantings > 0 && (
                    <Text size="xs" c="dimmed" mt="sm">
                        {summary.totalFieldsWithoutPlantings} field(s) available for new plantings
                    </Text>
                )}
            </Paper>

            <Grid>
                {/* Crop Breakdown */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="md" withBorder h="100%">
                        <Group mb="sm">
                            <IconChartBar size={20} />
                            <Title order={4}>Crop Breakdown</Title>
                        </Group>
                        <Divider mb="md" />
                        <ScrollArea h={300}>
                            <Stack gap="md">
                                {cropBreakdown.length > 0 ? (
                                    cropBreakdown.map((crop) => (
                                        <CropBreakdownItem key={crop.cropName} crop={crop} />
                                    ))
                                ) : (
                                    <Text c="dimmed" size="sm" ta="center" py="xl">
                                        No crop data available
                                    </Text>
                                )}
                            </Stack>
                        </ScrollArea>
                    </Paper>
                </Grid.Col>

                {/* Upcoming Harvests */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="md" withBorder h="100%">
                        <Group mb="sm">
                            <IconTractor size={20} />
                            <Title order={4}>Upcoming Harvests</Title>
                        </Group>
                        <Divider mb="md" />
                        <ScrollArea h={300}>
                            <Stack gap="md">
                                {upcomingHarvests.length > 0 ? (
                                    upcomingHarvests.map((harvest) => (
                                        <UpcomingHarvestItem key={harvest.id} harvest={harvest} />
                                    ))
                                ) : (
                                    <Text c="dimmed" size="sm" ta="center" py="xl">
                                        No upcoming harvests scheduled
                                    </Text>
                                )}
                            </Stack>
                        </ScrollArea>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Fields Without Plantings */}
            {fieldsWithNoActivePlantings.length > 0 && (
                <Paper p="md" withBorder>
                    <Group mb="sm" justify="space-between">
                        <Group>
                            <IconMapPin size={20} />
                            <Title order={4}>Fields Without Active Plantings</Title>
                        </Group>
                        <Badge size="lg" variant="light" color="gray">
                            {fieldsWithNoActivePlantings.length} Available
                        </Badge>
                    </Group>
                    <Divider mb="md" />
                    
                    {/* Search Bar */}
                    <TextInput
                        placeholder="Search fields by name..."
                        value={fieldSearch}
                        onChange={(e) => setFieldSearch(e.currentTarget.value)}
                        leftSection={<IconSearch size={16} />}
                        mb="md"
                        styles={{
                            input: {
                                height: "36px",
                            },
                        }}
                    />

                    <ScrollArea h={300}>
                        <Stack gap={4}>
                            {filteredFields.length > 0 ? (
                                filteredFields.map((field) => (
                                    <Paper key={field.fieldId} p="xs" withBorder radius="sm" style={{ backgroundColor: "var(--mantine-color-gray-0)" }}>
                                        <Group justify="space-between" wrap="nowrap">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Text fw={600} size="sm" truncate>
                                                    {field.fieldName}
                                                </Text>
                                                <Text size="xs" c="dimmed" mt={2}>
                                                    Size: {field.fieldSize} {field.sizeUnit}
                                                </Text>
                                            </div>
                                            <Badge size="sm" variant="light" color="green" style={{ flexShrink: 0 }}>
                                                Available
                                            </Badge>
                                        </Group>
                                    </Paper>
                                ))
                            ) : (
                                <Text c="dimmed" size="sm" ta="center" py="xl">
                                    {fieldSearch ? "No fields match your search" : "No available fields"}
                                </Text>
                            )}
                        </Stack>
                    </ScrollArea>
                </Paper>
            )}
        </Stack>
    );
}

// Crop Breakdown Item Component
function CropBreakdownItem({ crop }: { crop: CropBreakdown }) {
    return (
        <Box>
            <Group justify="space-between" mb={8}>
                <Group gap="xs">
                    <IconPlant2 size={18} color="var(--mantine-color-green-6)" />
                    <Text fw={600} size="sm">
                        {crop.cropName}
                    </Text>
                </Group>
                <Badge variant="light" color="green">
                    {crop.plantingCount} planting{crop.plantingCount !== 1 ? "s" : ""}
                </Badge>
            </Group>
            <Group justify="space-between">
                <Text size="xs" c="dimmed">
                    {crop.totalArea.toFixed(1)} acres • {crop.fieldsCount} field{crop.fieldsCount !== 1 ? "s" : ""}
                </Text>
            </Group>
            <Divider mt="sm" />
        </Box>
    );
}

// Upcoming Harvest Item Component
function UpcomingHarvestItem({ harvest }: { harvest: UpcomingHarvest }) {
    const isUrgent = harvest.daysUntilHarvest <= 7;
    const isSoon = harvest.daysUntilHarvest <= 14;

    return (
        <Box>
            <Group justify="space-between" mb={8}>
                <div>
                    <Group gap="xs">
                        <IconSeeding size={18} color="var(--mantine-color-orange-6)" />
                        <Text fw={600} size="sm">
                            {harvest.cropName}
                        </Text>
                    </Group>
                    <Text size="xs" c="dimmed" ml={26}>
                        {harvest.fieldName}
                    </Text>
                </div>
                <Badge
                    variant="light"
                    color={isUrgent ? "red" : isSoon ? "orange" : "blue"}
                >
                    {harvest.daysUntilHarvest} day{harvest.daysUntilHarvest !== 1 ? "s" : ""}
                </Badge>
            </Group>
            <Text size="xs" c="dimmed" ml={26}>
                Expected: {new Date(harvest.expectedHarvestDate).toLocaleDateString()}
            </Text>
            <Divider mt="sm" />
        </Box>
    );
}

