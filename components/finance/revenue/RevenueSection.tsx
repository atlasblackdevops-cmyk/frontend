"use client";

import { useState, useEffect } from "react";
import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/stores/use-auth-store";
import { hasPermission } from "@/lib/permissions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useToast } from "@/components/ui/useToast";
import { BaseInput } from "@/components/ui";
import type { RevenueRecord, FilterValues, CreateRevenueData } from "./types";
import { useRevenues } from "./hooks";
import { RevenueModal } from "./modals";
import { RevenueTable, RevenueFilters, RevenueFiltersDrawer } from "./components";

export default function RevenueSection() {
    const { permissions, role } = useAuth();

    // Permission checks
    const canList =
        hasPermission("FINANCE", "LISTING", permissions, role) ||
        hasPermission("FINANCE", "READ", permissions, role);
    const canCreate = hasPermission("FINANCE", "CREATE", permissions, role);
    const canUpdate = hasPermission("FINANCE", "UPDATE", permissions, role);
    const canDelete = hasPermission("FINANCE", "DELETE", permissions, role);

    // Hooks
    const {
        revenues,
        isLoading,
        pagination,
        error: revenuesError,
        fetchRevenues,
        createRevenue,
        updateRevenue,
        deleteRevenue,
        setPagination,
    } = useRevenues();

    // Modal/Drawer states
    const [modalOpen, setModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [revenueToUpdate, setRevenueToUpdate] = useState<RevenueRecord | null>(null);
    const [revenueToDelete, setRevenueToDelete] = useState<RevenueRecord | null>(null);

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
            revenueDateFrom: "",
            revenueDateTo: "",
        },
    });

    // Fetch revenues on mount and when filters change
    useEffect(() => {
        if (canList) {
            void fetchRevenues(pagination.page, {
                search: filterForm.values.search || undefined,
                revenueDateFrom: filterForm.values.revenueDateFrom || undefined,
                revenueDateTo: filterForm.values.revenueDateTo || undefined,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        canList,
        filterForm.values.search,
        filterForm.values.revenueDateFrom,
        filterForm.values.revenueDateTo,
        pagination.page,
        pagination.limit,
    ]);

    // Handle errors from hooks
    useEffect(() => {
        if (revenuesError) {
            setError(revenuesError);
            showToast(revenuesError, "red");
        }
    }, [revenuesError]);

    // Handle create revenue
    const handleCreateRevenue = async (values: unknown) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const success = await createRevenue(values as CreateRevenueData);

            if (success) {
                setModalOpen(false);
                showToast("Revenue created successfully", "green");
                void fetchRevenues(pagination.page, {
                    search: filterForm.values.search || undefined,
                    revenueDateFrom: filterForm.values.revenueDateFrom || undefined,
                    revenueDateTo: filterForm.values.revenueDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create revenue";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update revenue
    const handleUpdateRevenue = async (values: unknown) => {
        if (!revenueToUpdate) return;

        setIsUpdating(true);
        setError(null);

        try {
            const success = await updateRevenue(revenueToUpdate.id, values as CreateRevenueData);

            if (success) {
                setUpdateModalOpen(false);
                setRevenueToUpdate(null);
                showToast("Revenue updated successfully", "green");
                void fetchRevenues(pagination.page, {
                    search: filterForm.values.search || undefined,
                    revenueDateFrom: filterForm.values.revenueDateFrom || undefined,
                    revenueDateTo: filterForm.values.revenueDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update revenue";
            setError(message);
            showToast(message, "red");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle delete revenue
    const handleDeleteRevenue = async () => {
        if (!revenueToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const success = await deleteRevenue(revenueToDelete.id);

            if (success) {
                setDeleteModalOpen(false);
                setRevenueToDelete(null);
                showToast("Revenue deleted successfully", "green");
                void fetchRevenues(pagination.page, {
                    search: filterForm.values.search || undefined,
                    revenueDateFrom: filterForm.values.revenueDateFrom || undefined,
                    revenueDateTo: filterForm.values.revenueDateTo || undefined,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete revenue";
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
        void fetchRevenues(1, {
            search: searchValue || undefined,
            revenueDateFrom: filterForm.values.revenueDateFrom || undefined,
            revenueDateTo: filterForm.values.revenueDateTo || undefined,
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

    // Handle pagination changes
    const handlePageChange = (page: number) => {
        setPagination({ ...pagination, page });
    };

    // Handle edit click
    const handleEditClick = (revenue: RevenueRecord) => {
        setRevenueToUpdate(revenue);
        setUpdateModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (revenue: RevenueRecord) => {
        setRevenueToDelete(revenue);
        setDeleteModalOpen(true);
    };

    if (!canList) {
        return (
            <Paper p="xl" withBorder>
                <Text c="red">You don't have permission to view revenues.</Text>
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
                maxWidth: "100%",
            }}
        >
            {/* Header - Fixed */}
            <Group justify="space-between" align="center" mb="lg" style={{ flexShrink: 0 }}>
                <div>
                    <Title order={2}>Revenues</Title>
                    <Text c="dimmed" size="sm">
                        Manage revenues and track farm income
                    </Text>
                </div>
                {canCreate && (
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setModalOpen(true)}
                    >
                        Add Revenue
                    </Button>
                )}
            </Group>

            {/* Toast - Fixed */}
            <div style={{ flexShrink: 0, marginBottom: "1rem" }}>
                <Toast />
            </div>

            {/* Content - Scrollable */}
            <Stack gap="lg" style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                {/* Search and Filters */}
                <Group gap="md" align="stretch" justify="space-between" wrap="wrap">
                    <BaseInput
                        placeholder="Search by buyer name, product..."
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
                                void fetchRevenues(1, {
                                    search: filterForm.values.search || undefined,
                                    revenueDateFrom: filterForm.values.revenueDateFrom || undefined,
                                    revenueDateTo: filterForm.values.revenueDateTo || undefined,
                                });
                            }
                        }}
                    />
                    <RevenueFilters
                        onOpenFilters={() => setFiltersDrawerOpen(true)}
                    />
                </Group>

                {/* Table */}
                <div style={{ width: "100%" }}>
                    <RevenueTable
                        revenues={revenues}
                        pagination={pagination}
                        isLoading={isLoading}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        onUpdate={handleEditClick}
                        onDelete={handleDeleteClick}
                        onPageChange={handlePageChange}
                    />
                </div>
            </Stack>

            {/* Modals */}
            {canCreate && (
                <RevenueModal
                    mode="create"
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreateRevenue}
                    isSubmitting={isSubmitting}
                />
            )}

            {canUpdate && revenueToUpdate && (
                <RevenueModal
                    mode="update"
                    revenue={revenueToUpdate}
                    opened={updateModalOpen}
                    onClose={() => {
                        setUpdateModalOpen(false);
                        setRevenueToUpdate(null);
                    }}
                    onSubmit={handleUpdateRevenue}
                    isSubmitting={isUpdating}
                />
            )}

            {/* Filters Drawer */}
            <RevenueFiltersDrawer
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
                    setRevenueToDelete(null);
                }}
                onConfirm={handleDeleteRevenue}
                title="Delete Revenue"
                message={`Are you sure you want to delete this revenue of ${revenueToDelete?.currencyType} ${revenueToDelete?.amount}? This action cannot be undone.`}
                isDeleting={isDeleting}
                itemName={`${revenueToDelete?.currencyType} ${revenueToDelete?.amount}`}
                itemType="revenue"
            />
        </Paper>
    );
}

