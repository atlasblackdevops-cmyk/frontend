"use client";

import { useState, useEffect } from "react";
import {
    Paper,
    Stack,
    Text,
    Title,
    Group,
    Loader,
    Center,
    SimpleGrid,
    Select,
    Button,
} from "@mantine/core";
import { IconCalendar, IconRefresh } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import { useToast } from "@/components/ui/useToast";
import { BaseDateInput } from "@/components/ui";
import { useFinanceDashboard } from "./hooks";
import { getDashboardTrends } from "@/lib/finance/dashboard/api";
import type {
    DashboardSummaryResponse,
    DashboardTrendsResponse,
    DashboardBreakdownResponse,
} from "./types";
import {
    SummaryCards,
    TrendsChart,
    ExpenseCategoriesChart,
    TopVendorsTable,
    TopBuyersTable,
    RevenueByProductTable,
    PaymentMethodsChart,
    RecentTransactions,
} from "./components";

export default function FinanceDashboardSection() {
    const { farmId, permissions, role } = useAuth();

    // Permission checks
    const canList =
        hasPermission("FINANCE", "LIST", permissions, role) ||
        hasPermission("FINANCE", "READ", permissions, role);

    const { isLoading: isLoadingHook, error, fetchSummary, fetchTrends, fetchBreakdown } =
        useFinanceDashboard();

    // State
    const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
    const [trends, setTrends] = useState<DashboardTrendsResponse | null>(null);
    const [breakdown, setBreakdown] = useState<DashboardBreakdownResponse | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingTrends, setIsLoadingTrends] = useState(false);

    // Date range state - default to current year
    const currentYear = new Date().getFullYear();
    const [dateFrom, setDateFrom] = useState(
        `${currentYear}-01-01`
    );
    const [dateTo, setDateTo] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [groupBy, setGroupBy] = useState<"day" | "week" | "month" | "year">("week");

    const { Toast, showToast } = useToast();

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        if (!farmId || !canList) return;

        setIsLoadingData(true);
        try {
            // Fetch all data in parallel
            const [summaryData, trendsData, breakdownData] = await Promise.all([
                fetchSummary({
                    dateFrom,
                    dateTo,
                    period: "monthly",
                }),
                fetchTrends({
                    dateFrom,
                    dateTo,
                    groupBy,
                }),
                fetchBreakdown({
                    dateFrom,
                    dateTo,
                    type: "all",
                    limit: 10,
                }),
            ]);

            if (summaryData) setSummary(summaryData);
            if (trendsData) setTrends(trendsData);
            if (breakdownData) setBreakdown(breakdownData);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch dashboard data";
            showToast(message, "red");
        } finally {
            setIsLoadingData(false);
        }
    };

    // Fetch only trends data (when groupBy changes) - call API directly to avoid hook's loading state
    const fetchTrendsData = async () => {
        if (!farmId || !canList) return;

        setIsLoadingTrends(true);
        try {
            const trendsData = await getDashboardTrends({
                dateFrom,
                dateTo,
                groupBy,
            });
            if (trendsData) setTrends(trendsData);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch trends data";
            showToast(message, "red");
        } finally {
            setIsLoadingTrends(false);
        }
    };

    // Fetch all data on mount and when date filters change
    useEffect(() => {
        void fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [farmId, canList, dateFrom, dateTo]);

    // Fetch only trends when groupBy changes (doesn't affect other components)
    useEffect(() => {
        if (farmId && canList) {
            void fetchTrendsData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupBy]);

    // Handle group by change from TrendsChart
    const handleGroupByChange = (newGroupBy: "day" | "week" | "month" | "year") => {
        setGroupBy(newGroupBy);
    };

    if (!canList) {
        return (
            <Paper p="xl" withBorder>
                <Text c="red">
                    You don't have permission to view the finance dashboard.
                </Text>
            </Paper>
        );
    }

    // Only use hook's loading for full page loads (not for trends-only updates)
    const isLoading = isLoadingData || (isLoadingHook && !isLoadingTrends);

    return (
        <Paper
            p={26}
            radius="none"
            withBorder={false}
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                maxWidth: "100%",
            }}
        >
            {/* Header */}
            <Group justify="space-between" align="center" mb="lg" style={{ flexShrink: 0 }}>
                <div>
                    <Title order={2}>Finance Dashboard</Title>
                    <Text c="dimmed" size="sm">
                        Overview of your farm's financial performance
                    </Text>
                </div>
                <Button
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => void fetchDashboardData()}
                    loading={isLoading}
                    variant="subtle"
                    size="xs"
                    title="Refresh all dashboard data"
                >
                    Refresh All
                </Button>
            </Group>

            {/* Toast */}
            <div style={{ flexShrink: 0, marginBottom: "1rem" }}>
                <Toast />
            </div>

            {/* Date Range Filters */}
            <Group gap="md" mb="lg" style={{ flexShrink: 0 }}>
                <BaseDateInput
                    label="From Date"
                    placeholder="Select start date"
                    value={dateFrom}
                    onChange={(value) => setDateFrom(value || "")}
                    style={{ flex: 1, maxWidth: 200 }}
                />
                <BaseDateInput
                    label="To Date"
                    placeholder="Select end date"
                    value={dateTo}
                    onChange={(value) => setDateTo(value || "")}
                    style={{ flex: 1, maxWidth: 200 }}
                />
            </Group>

            {/* Content - Scrollable */}
            <Stack gap="lg" pb="lg" style={{ flex: 1, overflow: "auto", width: "100%" }}>
                {isLoading && !summary && !trends && !breakdown ? (
                    <Center h={400}>
                        <Stack align="center" gap="md">
                            <Loader size="lg" />
                            <Text c="dimmed">Loading dashboard data...</Text>
                        </Stack>
                    </Center>
                ) : error ? (
                    <Paper p="xl" withBorder>
                        <Text c="red" ta="center">
                            {error}
                        </Text>
                    </Paper>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <SummaryCards data={summary} isLoading={isLoading} />

                        {/* Trends Chart */}
                        <TrendsChart
                            data={trends}
                            isLoading={isLoadingTrends || (isLoading && !trends)}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            groupBy={groupBy}
                            onGroupByChange={handleGroupByChange}
                        />

                        {/* Breakdown Section */}
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                            <ExpenseCategoriesChart
                                data={breakdown?.expenseCategories || []}
                                isLoading={isLoading}
                            />
                            <PaymentMethodsChart
                                data={breakdown?.paymentMethods || null}
                                isLoading={isLoading}
                            />
                        </SimpleGrid>

                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                            <TopVendorsTable
                                data={breakdown?.topVendors || []}
                                isLoading={isLoading}
                            />
                            <TopBuyersTable
                                data={breakdown?.topBuyers || []}
                                isLoading={isLoading}
                            />
                        </SimpleGrid>

                        {/* Revenue by Product */}
                        {breakdown?.revenueByProduct && breakdown.revenueByProduct.length > 0 && (
                            <RevenueByProductTable
                                data={breakdown.revenueByProduct}
                                isLoading={isLoading}
                            />
                        )}

                        {/* Recent Transactions */}
                        <RecentTransactions
                            data={breakdown?.recentTransactions || null}
                            isLoading={isLoading}
                        />
                    </>
                )}
            </Stack>
        </Paper>
    );
}

