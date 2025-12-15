"use client";

import { useState, useMemo } from "react";
import { Group, Paper, Stack, Text, Grid, ScrollArea } from "@mantine/core";
import { IconCurrencyDollar, IconMap2, IconSearch } from "@tabler/icons-react";
import { BaseInput } from "@/components/ui";
import type { IrrigationCostSummaryItem } from "../types";

interface IrrigationCostSummaryProps {
    summary: IrrigationCostSummaryItem[];
    totalFields: number;
    totalCost: number;
    isLoading?: boolean;
}

export default function IrrigationCostSummary({
    summary,
    totalFields,
    totalCost,
    isLoading = false,
}: IrrigationCostSummaryProps) {
    const [searchValue, setSearchValue] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const filteredSummary = useMemo(() => {
        if (!searchValue.trim()) {
            return summary;
        }
        const searchTerm = searchValue.toLowerCase().trim();
        return summary.filter((item) =>
            item.fieldName.toLowerCase().includes(searchTerm)
        );
    }, [summary, searchValue]);

    return (
        <Grid gutter="md">
            {/* Left side - Two stacked boxes */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
                <Stack gap="md">
                    {/* Total Fields Box */}
                    <Paper
                        withBorder
                        p="md"
                        radius="md"
                        style={{
                            height: "100%",
                            minHeight: "120px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Stack gap="xs" align="center" style={{ width: "100%" }}>
                            <div style={{ opacity: 0.7 }}>
                                <IconMap2 size={32} color="var(--mantine-color-blue-6)" />
                            </div>
                            <Text size="xl" fw={700} c="blue">
                                {totalFields}
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                Total Fields
                            </Text>
                        </Stack>
                    </Paper>

                    {/* Total Cost Box */}
                    <Paper
                        withBorder
                        p="md"
                        radius="md"
                        style={{
                            height: "100%",
                            minHeight: "120px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Stack gap="xs" align="center" style={{ width: "100%" }}>
                            <div style={{ opacity: 0.7 }}>
                                <IconCurrencyDollar size={32} color="var(--mantine-color-green-6)" />
                            </div>
                            <Text size="xl" fw={700} c="green">
                                {formatCurrency(totalCost)}
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                Total Cost
                            </Text>
                        </Stack>
                    </Paper>
                </Stack>
            </Grid.Col>

            {/* Right side - Fields list with search */}
            <Grid.Col span={{ base: 12, sm: 8 }}>
                <Paper
                    withBorder
                    p={0}
                    radius="md"
                    style={{
                        height: "295px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    {/* Fixed Search Bar */}
                    <div style={{ flexShrink: 0,padding: "10px", paddingBottom: 10 ,marginBottom: 10, borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                        <BaseInput
                            placeholder="Search fields..."
                            leftSection={<IconSearch size={16} />}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.currentTarget.value)}
                            styles={{
                                input: {
                                    height: "36px",
                                    minHeight: "36px",
                                },
                            }}
                        />
                    </div>

                    {/* Scrollable Fields List */}
                    <ScrollArea
                        style={{
                            flex: 1,
                            minHeight: 0,
                            padding: "0px 10px",
                        }}
                    >
                        <Stack gap="xs">
                            {filteredSummary.length > 0 ? (
                                filteredSummary.map((item, index) => (
                                    <Group
                                        key={item.fieldId}
                                        justify="space-between"
                                        style={{
                                            padding: "0px 4px",
                                            paddingRight: "12px",
                                            paddingBottom: index === filteredSummary.length - 1 ? "12px" : "6px",
                                            borderBottom:
                                                index === filteredSummary.length - 1
                                                    ? "none"
                                                    : "1px solid var(--mantine-color-gray-2)",
                                        }}
                                    >
                                        <Text size="sm" fw={500}>
                                            {item.fieldName}
                                        </Text>
                                        <Text size="sm" fw={600} c="green">
                                            {formatCurrency(item.totalCost)}
                                        </Text>
                                    </Group>
                                ))
                            ) : (
                                <Text size="sm" c="dimmed" ta="center" py="md">
                                    {searchValue.trim()
                                        ? "No fields found matching your search"
                                        : "No fields with irrigation records"}
                                </Text>
                            )}
                        </Stack>
                    </ScrollArea>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}

