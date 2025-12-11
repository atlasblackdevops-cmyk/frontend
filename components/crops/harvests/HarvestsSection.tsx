"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Group,
    Paper,
    Pagination,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch, IconDownload } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type { HarvestRecord, FilterValues, CreateHarvestData } from "./types";
import { useHarvests } from "./hooks";
import { HarvestModal } from "./modals";
import {
    HarvestTable,
    HarvestFilters,
    HarvestFiltersDrawer,
    YieldBySeasonChart,
} from "./components";
import { getYieldBySeason, exportHarvestsToCSV } from "@/lib/crops/api";
import { useQuery } from "@tanstack/react-query";

export default function HarvestsSection() {
    const { farmId, permissions, role } = useAuth();

    // Permission checks
    const canList =
        hasPermission("CROPS", "LIST", permissions, role) ||
        hasPermission("CROPS", "READ", permissions, role);
    const canCreate = hasPermission("CROPS", "CREATE", permissions, role);
    const canUpdate = hasPermission("CROPS", "UPDATE", permissions, role);
    const canDelete = hasPermission("CROPS", "DELETE", permissions, role);

    // Hooks
    const {
        harvests,
        isLoading,
        pagination,
        error: harvestsError,
        fetchHarvests,
        createHarvest,
        updateHarvest,
        deleteHarvest,
        setPagination,
    } = useHarvests();

    // Fetch yield by season data
    const { data: yieldData, isLoading: loadingYield } = useQuery({
        queryKey: ["yield-by-season", farmId],
        queryFn: async () => {
            const response = await getYieldBySeason();
            return response?.data?.yields ?? [];
        },
        enabled: canList,
    });

    // Modal/Drawer states
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [harvestToUpdate, setHarvestToUpdate] =
        useState<HarvestRecord | null>(null);
    const [harvestToDelete, setHarvestToDelete] =
        useState<HarvestRecord | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Messages
    const [error, setError] = useState<string | null>(null);
    const { Toast, showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Search and filters
    const filterForm = useForm<FilterValues>({
        initialValues: {
            search: "",
            cropType: "",
            fieldId: "",
            harvestDateFrom: "",
            harvestDateTo: "",
        },
    });

    // Fetch harvests on mount and when filters change
    useEffect(() => {
        if (canList) {
            void fetchHarvests(pagination.page, {
                search: filterForm.values.search || undefined,
                cropType: filterForm.values.cropType || undefined,
                fieldId: filterForm.values.fieldId || undefined,
                harvestDateFrom: filterForm.values.harvestDateFrom || undefined,
                harvestDateTo: filterForm.values.harvestDateTo || undefined,
            });
        }
    }, [
        canList,
        filterForm.values.search,
        filterForm.values.cropType,
        filterForm.values.fieldId,
        filterForm.values.harvestDateFrom,
        filterForm.values.harvestDateTo,
        pagination.page,
        pagination.limit,
    ]);

    // Handle errors from hooks
    useEffect(() => {
        if (harvestsError) {
            setError(harvestsError);
            showToast(harvestsError, "red");
        }
    }, [harvestsError]);

    // Handle create harvest
    const handleCreateHarvest = async (values: unknown) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const success = await createHarvest(values as CreateHarvestData);

            if (success) {
                setModalOpen(false);
                showToast("Harvest record created successfully", "green");
                void fetchHarvests(pagination.page, {
                    search: filterForm.values.search || undefined,
                    cropType: filterForm.values.cropType || undefined,
                    fieldId: filterForm.values.fieldId || undefined,
                    harvestDateFrom:
                        filterForm.values.harvestDateFrom || undefined,
                    harvestDateTo: filterForm.values.harvestDateTo || undefined,
                });
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to create harvest record";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update harvest
    const handleUpdateHarvest = async (values: unknown) => {
        if (!harvestToUpdate) return;

        setIsUpdating(true);
        setError(null);

        try {
            const success = await updateHarvest(
                harvestToUpdate.id,
                values as CreateHarvestData
            );

            if (success) {
                setUpdateModalOpen(false);
                setHarvestToUpdate(null);
                showToast("Harvest record updated successfully", "green");
                void fetchHarvests(pagination.page, {
                    search: filterForm.values.search || undefined,
                    cropType: filterForm.values.cropType || undefined,
                    fieldId: filterForm.values.fieldId || undefined,
                    harvestDateFrom:
                        filterForm.values.harvestDateFrom || undefined,
                    harvestDateTo: filterForm.values.harvestDateTo || undefined,
                });
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to update harvest record";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle delete harvest
    const handleDeleteHarvest = async () => {
        if (!harvestToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const success = await deleteHarvest(harvestToDelete.id);

            if (success) {
                setDeleteModalOpen(false);
                setHarvestToDelete(null);
                showToast("Harvest record deleted successfully", "green");
                void fetchHarvests(pagination.page, {
                    search: filterForm.values.search || undefined,
                    cropType: filterForm.values.cropType || undefined,
                    fieldId: filterForm.values.fieldId || undefined,
                    harvestDateFrom:
                        filterForm.values.harvestDateFrom || undefined,
                    harvestDateTo: filterForm.values.harvestDateTo || undefined,
                });
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to delete harvest record";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle search change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.currentTarget.value;
        filterForm.setFieldValue("search", searchValue);
        void fetchHarvests(1, {
            search: searchValue || undefined,
            cropType: filterForm.values.cropType || undefined,
            fieldId: filterForm.values.fieldId || undefined,
            harvestDateFrom: filterForm.values.harvestDateFrom || undefined,
            harvestDateTo: filterForm.values.harvestDateTo || undefined,
        });
    };

    // Handle filter apply
    const handleApplyFilters = (newFilters: FilterValues) => {
        filterForm.setValues(newFilters);
        setFiltersDrawerOpen(false);
        // Filters are applied via useEffect when filterForm.values change
    };

    // Handle clear filters
    const handleClearFilters = () => {
        filterForm.reset();
        setFiltersDrawerOpen(false);
    };

    // Handle edit click
    const handleEditClick = (harvest: HarvestRecord) => {
        setHarvestToUpdate(harvest);
        setUpdateModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (harvest: HarvestRecord) => {
        setHarvestToDelete(harvest);
        setDeleteModalOpen(true);
    };

    // Handle CSV export
    const handleExportCSV = async () => {
        setIsExporting(true);
        setError(null);

        try {
            const blob = await exportHarvestsToCSV({
                search: filterForm.values.search || undefined,
                cropType: filterForm.values.cropType || undefined,
                fieldId: filterForm.values.fieldId || undefined,
                harvestDateFrom: filterForm.values.harvestDateFrom || undefined,
                harvestDateTo: filterForm.values.harvestDateTo || undefined,
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `harvests-export-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast("Harvests exported successfully", "green");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to export harvests";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsExporting(false);
        }
    };

    if (!canList) {
        return (
            <Paper p="xl" withBorder>
                <Text c="red">
                    You don't have permission to view harvest records.
                </Text>
            </Paper>
        );
    }

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
            }}
        >
            <Stack
                gap="md"
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    alignItems: "stretch",
                }}
            >
                {/* Header */}
                <Group
                    justify="space-between"
                    align="center"
                    style={{ flexShrink: 0 }}
                >
                    <div>
                        <Title order={2}>Harvest Records</Title>
                        <Text c="dimmed" size="sm">
                            Record harvest results to track yield performance
                        </Text>
                    </div>
                    <Group gap="md">
                        <Button
                            variant="outline"
                            leftSection={<IconDownload size={16} />}
                            onClick={handleExportCSV}
                            loading={isExporting}
                        >
                            Export CSV
                        </Button>
                        {canCreate && (
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => setModalOpen(true)}
                            >
                                Add Harvest
                            </Button>
                        )}
                    </Group>
                </Group>

                {/* Toast */}
                <div style={{ flexShrink: 0 }}>
                    <Toast />
                </div>

                {/* Yield Chart - Compact and collapsible */}
                <YieldBySeasonChart
                    data={yieldData || []}
                    isLoading={loadingYield}
                />

                {/* Search and Filters */}
                <Group
                    gap="md"
                    align="stretch"
                    justify="space-between"
                    wrap="nowrap"
                    style={{ flexShrink: 0 }}
                >
                    <BaseInput
                        placeholder="Search by crop type, field name..."
                        leftSection={<IconSearch size={16} />}
                        style={{
                            width: "100%",
                            maxWidth: 500,
                            flex: "1 1 0",
                            minWidth: 0,
                        }}
                        styles={{
                            input: {
                                height: "42px",
                                minHeight: "42px",
                            },
                        }}
                        value={filterForm.values.search}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                void fetchHarvests(1, {
                                    search:
                                        filterForm.values.search || undefined,
                                    cropType:
                                        filterForm.values.cropType || undefined,
                                    fieldId:
                                        filterForm.values.fieldId || undefined,
                                    harvestDateFrom:
                                        filterForm.values.harvestDateFrom ||
                                        undefined,
                                    harvestDateTo:
                                        filterForm.values.harvestDateTo ||
                                        undefined,
                                });
                            }
                        }}
                    />
                    <HarvestFilters
                        onOpenFilters={() => setFiltersDrawerOpen(true)}
                    />
                </Group>

                {/* Table - Scrollable container */}
                <div
                    style={{
                        flex: "1 1 0",
                        minHeight: 0,
                        width: "100%",
                        maxHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            flex: "1 1 0",
                            minHeight: 0,
                            maxHeight: "100%",
                            overflow: "auto",
                        }}
                    >
                        <HarvestTable
                            harvests={harvests}
                            isLoading={isLoading}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            onUpdate={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Group
                        justify="center"
                        style={{
                            flexShrink: 0,
                            paddingTop: 16,
                            paddingBottom: 16,
                        }}
                    >
                        <Pagination
                            value={pagination.page}
                            onChange={(page) =>
                                setPagination({ ...pagination, page })
                            }
                            total={pagination.totalPages}
                            size="sm"
                        />
                    </Group>
                )}
            </Stack>

            {/* Modals */}
            {canCreate && (
                <HarvestModal
                    mode="create"
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreateHarvest}
                    isSubmitting={isSubmitting}
                />
            )}

            {canUpdate && harvestToUpdate && (
                <HarvestModal
                    mode="update"
                    harvest={harvestToUpdate}
                    opened={updateModalOpen}
                    onClose={() => {
                        setUpdateModalOpen(false);
                        setHarvestToUpdate(null);
                    }}
                    onSubmit={handleUpdateHarvest}
                    isSubmitting={isUpdating}
                />
            )}

            {/* Filters Drawer */}
            <HarvestFiltersDrawer
                opened={filtersDrawerOpen}
                onClose={() => setFiltersDrawerOpen(false)}
                filters={filterForm.values}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setHarvestToDelete(null);
                }}
                onConfirm={handleDeleteHarvest}
                title="Delete Harvest Record"
                message={`Are you sure you want to delete the harvest record for "${harvestToDelete?.cropType}"? This action cannot be undone.`}
                isDeleting={isDeleting}
                itemName={harvestToDelete?.cropType || ""}
                itemType="harvest record"
            />
        </Paper>
    );
}
